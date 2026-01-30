'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Share2, TrendingUp } from 'lucide-react';

interface AnalysisItem {
  id: string;
  filename: string;
  timestamp: string;
  result?: {
    type: string;
    confidence: number;
    summary: string;
    risks: string[];
    flags: string[];
  };
  proofHash?: string;
}

interface ResultsDashboardProps {
  analyses?: AnalysisItem[];
}

export function ResultsDashboard({ analyses = [] }: ResultsDashboardProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(
    null
  );

  const stats = useMemo(() => {
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageConfidence: 0,
        flaggedCount: 0,
        riskDetectionRate: 0,
        confidenceHistory: [],
        typeDistribution: [],
      };
    }

    const totalAnalyses = analyses.length;
    const flaggedCount = analyses.filter(
      (a) => a.result?.flags.length ?? 0 > 0
    ).length;
    const riskDetectionRate =
      (analyses.filter((a) => (a.result?.risks.length ?? 0) > 0).length /
        totalAnalyses) *
      100;
    const averageConfidence =
      analyses.reduce((sum, a) => sum + (a.result?.confidence ?? 0), 0) /
      totalAnalyses;

    const confidenceHistory = analyses
      .slice()
      .reverse()
      .map((a) => ({
        name: new Date(a.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        confidence: a.result?.confidence ?? 0,
      }));

    const typeMap = new Map<string, number>();
    analyses.forEach((a) => {
      const type = a.result?.type ?? 'Unknown';
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    });

    const typeDistribution = Array.from(typeMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      totalAnalyses,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      flaggedCount,
      riskDetectionRate: Math.round(riskDetectionRate),
      confidenceHistory,
      typeDistribution,
    };
  }, [analyses]);

  const COLORS = ['#6b63ff', '#00d4ff', '#ffa502', '#ff4757', '#2ed573'];

  if (analyses.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground font-medium">No analyses yet</p>
        <p className="text-sm text-muted-foreground">
          Your analysis history and statistics will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Analyses</p>
          <p className="text-2xl font-bold text-foreground">
            {stats.totalAnalyses}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">
            Avg Confidence
          </p>
          <p className="text-2xl font-bold text-accent">
            {stats.averageConfidence.toFixed(1)}%
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Risk Detection</p>
          <p className="text-2xl font-bold text-yellow-500">
            {stats.riskDetectionRate}%
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Flagged</p>
          <p className="text-2xl font-bold text-red-500">{stats.flaggedCount}</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Confidence Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Confidence Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.confidenceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2749" />
              <XAxis stroke="#8b92b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8b92b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12172e',
                  border: '1px solid #1e2749',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e8ecff' }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#6b63ff"
                strokeWidth={2}
                dot={{ fill: '#6b63ff', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Analysis Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Analysis Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12172e',
                  border: '1px solid #1e2749',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e8ecff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Analysis Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Analyses
        </h3>
        <div className="space-y-3">
          {analyses.slice(0, 10).map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => setSelectedAnalysis(analysis)}
              className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {analysis.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(analysis.timestamp).toLocaleString()}
                  </p>
                  {analysis.result && (
                    <p className="text-sm text-accent mt-1">
                      {analysis.result.type}
                    </p>
                  )}
                </div>
                {analysis.result && (
                  <div className="flex-shrink-0 ml-4 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {analysis.result.confidence.toFixed(0)}%
                    </p>
                    {analysis.result.flags.length > 0 && (
                      <Badge className="mt-2 bg-red-500/20 text-red-300 border-red-500/30">
                        Flagged
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Detailed Analysis Modal */}
      {selectedAnalysis && (
        <Card className="p-6 border-accent border-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedAnalysis.filename}
            </h3>
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {selectedAnalysis.result && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-foreground font-medium">
                    {selectedAnalysis.result.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-foreground font-medium">
                    {selectedAnalysis.result.confidence.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="text-foreground font-medium text-sm">
                    {new Date(selectedAnalysis.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Summary</p>
                <p className="text-foreground">{selectedAnalysis.result.summary}</p>
              </div>

              {selectedAnalysis.result.risks.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Detected Risks
                  </p>
                  <ul className="space-y-1">
                    {selectedAnalysis.result.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        <span className="text-yellow-500">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAnalysis.result.flags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Flags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedAnalysis.result.flags.map((flag, i) => (
                      <Badge
                        key={i}
                        className="bg-red-500/20 text-red-300 border-red-500/30"
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.proofHash && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    ZK Proof Hash
                  </p>
                  <code className="text-xs text-accent font-mono break-all block p-2 bg-secondary rounded">
                    {selectedAnalysis.proofHash}
                  </code>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
