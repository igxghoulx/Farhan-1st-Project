/**
 * TrustLens AI - Application Root & Router
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AnalyzerPage } from './pages/AnalyzerPage.js';
import { ResultPage } from './pages/ResultPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { FloatingChatWidget } from './components/FloatingChatWidget.js';
import { ErrorState } from './components/ErrorState.js';
import { LoadingState } from './components/LoadingState.js';
import { AnalysisReport, ScanStageUpdate, TargetType } from './types/analysis.js';

const INITIAL_URL_STAGES: ScanStageUpdate[] = [
  { stageId: 'checking_url', label: 'Checking URL format & protocol...', status: 'in_progress' },
  { stageId: 'resolving_dns', label: 'Resolving DNS records...', status: 'pending' },
  { stageId: 'inspecting_http', label: 'Inspecting HTTP response & redirects...', status: 'pending' },
  { stageId: 'checking_tls', label: 'Checking TLS certificates & handshake...', status: 'pending' },
  { stageId: 'analyzing_headers', label: 'Analyzing security headers...', status: 'pending' },
  { stageId: 'evaluating_patterns', label: 'Evaluating URL structure signals...', status: 'pending' },
  { stageId: 'generating_ai', label: 'Generating AI explanation from evidence...', status: 'pending' },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [samples, setSamples] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeScanTarget, setActiveScanTarget] = useState<string>('');
  const [activeScanType, setActiveScanType] = useState<TargetType>('url');
  const [scanStages, setScanStages] = useState<ScanStageUpdate[]>(INITIAL_URL_STAGES);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetchingResult, setIsFetchingResult] = useState<boolean>(false);

  // Synchronize history navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch sample scans on load
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples && Array.isArray(data.samples)) {
          setSamples(data.samples);
        }
      })
      .catch((err) => {
        console.warn('Failed to load sample scans:', err);
      });
  }, []);

  // Handle route changes and deep links like /result/:id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (currentPath.startsWith('/result/')) {
      const reportId = currentPath.replace('/result/', '').trim();
      if (reportId && (!currentReport || currentReport.id !== reportId)) {
        setIsFetchingResult(true);
        fetch(`/api/result/${reportId}`)
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Report not found');
            }
            return res.json();
          })
          .then((data) => {
            setCurrentReport(data.report);
            setErrorMessage(null);
          })
          .catch((err) => {
            setErrorMessage(err.message || 'Unable to retrieve assessment report.');
          })
          .finally(() => {
            setIsFetchingResult(false);
          });
      }
    }
  }, [currentPath]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setErrorMessage(null);
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsLoading(true);
    setActiveScanTarget(url);
    setActiveScanType('url');
    setScanStages(INITIAL_URL_STAGES);
    setErrorMessage(null);

    // If on landing, navigate to /analyze
    if (currentPath !== '/analyze') {
      window.history.pushState({}, '', '/analyze');
      setCurrentPath('/analyze');
    }

    try {
      // Connect to SSE Stream Endpoint for real-time observable progress
      const res = await fetch('/api/analyze/url/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok || !res.body) {
        // Fallback to regular JSON endpoint
        const fallbackRes = await fetch('/api/analyze/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok || !fallbackData.success) {
          throw new Error(fallbackData.error || 'Failed to analyze target URL.');
        }
        setCurrentReport(fallbackData.report);
        navigateTo(`/result/${fallbackData.report.id}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedReport: AnalysisReport | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const matchEvent = block.match(/^event:\s*(.+)$/m);
          const matchData = block.match(/^data:\s*(.+)$/m);

          const eventName = matchEvent ? matchEvent[1].trim() : 'message';
          const dataStr = matchData ? matchData[1].trim() : null;

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventName === 'stage') {
              setScanStages((prev) =>
                prev.map((s) => {
                  if (s.stageId === data.stageId) {
                    return {
                      ...s,
                      status: data.status,
                      detail: data.detail || s.detail,
                    };
                  }
                  return s;
                })
              );
            } else if (eventName === 'complete') {
              receivedReport = data.report;
            } else if (eventName === 'error') {
              throw new Error(data.error || 'Diagnostic evaluation failed.');
            }
          } catch (jsonErr: any) {
            if (jsonErr.message && !jsonErr.message.includes('JSON')) {
              throw jsonErr;
            }
          }
        }
      }

      if (receivedReport) {
        setCurrentReport(receivedReport);
        navigateTo(`/result/${receivedReport.id}`);
      } else {
        throw new Error('Analysis completed without returning a valid report object.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during URL evaluation.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMessage = async (message: string) => {
    setIsLoading(true);
    setActiveScanTarget(message.length > 50 ? `${message.slice(0, 47)}...` : message);
    setActiveScanType('message');
    setErrorMessage(null);

    if (currentPath !== '/analyze') {
      window.history.pushState({}, '', '/analyze');
      setCurrentPath('/analyze');
    }

    try {
      const startTime = Date.now();
      const res = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze message content.');
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 1800) {
        await new Promise((resolve) => setTimeout(resolve, 1800 - elapsed));
      }

      setCurrentReport(data.report);
      navigateTo(`/result/${data.report.id}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during message evaluation.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: AnalysisReport) => {
    setCurrentReport(sample);
    navigateTo(`/result/${sample.id}`);
  };

  const handleRescan = (target: string, type: 'url' | 'message') => {
    if (type === 'url') {
      handleAnalyzeUrl(target);
    } else {
      handleAnalyzeMessage(target);
    }
  };

  // Render Page Content
  const renderContent = () => {
    if (errorMessage) {
      return (
        <div className="py-20 px-4">
          <ErrorState
            message={errorMessage}
            onRetry={() => {
              setErrorMessage(null);
              if (activeScanTarget) {
                handleRescan(activeScanTarget, activeScanType);
              } else {
                navigateTo('/analyze');
              }
            }}
            onBack={() => {
              setErrorMessage(null);
              navigateTo('/analyze');
            }}
          />
        </div>
      );
    }

    if (currentPath.startsWith('/result/')) {
      if (isFetchingResult) {
        return (
          <div className="py-16">
            <LoadingState />
          </div>
        );
      }
      if (currentReport) {
        return (
          <ResultPage
            report={currentReport}
            onNavigate={navigateTo}
            onRescan={handleRescan}
          />
        );
      }
      return (
        <div className="py-20 px-4">
          <ErrorState
            title="Report Not Found"
            message="The requested risk assessment report does not exist or has expired from temporary memory."
            onBack={() => navigateTo('/analyze')}
          />
        </div>
      );
    }

    if (currentPath === '/analyze') {
      return (
        <AnalyzerPage
          onAnalyzeUrl={handleAnalyzeUrl}
          onAnalyzeMessage={handleAnalyzeMessage}
          onSelectSample={handleSelectSample}
          samples={samples}
          isLoading={isLoading}
          activeScanTarget={activeScanTarget}
          activeScanType={activeScanType}
          scanStages={scanStages}
          onNavigate={navigateTo}
        />
      );
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/chat') {
      return <ChatPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/privacy') {
      return <PrivacyPage onNavigate={navigateTo} />;
    }

    // Default Landing Page
    return (
      <LandingPage
        onAnalyzeUrl={handleAnalyzeUrl}
        onAnalyzeMessage={handleAnalyzeMessage}
        onSelectSample={handleSelectSample}
        samples={samples}
        isLoading={isLoading}
        onNavigate={navigateTo}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 cyber-grid">
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />
      <main className="flex-1">{renderContent()}</main>
      <Footer onNavigate={navigateTo} />
      <FloatingChatWidget onNavigate={navigateTo} currentPath={currentPath} />
    </div>
  );
}
