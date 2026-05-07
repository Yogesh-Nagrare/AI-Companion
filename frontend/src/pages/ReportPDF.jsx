// src/components/ReportPDF.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const SEV_COLORS = {
  Low: '#34D399',
  Moderate: '#FBBF24',
  High: '#F97316',
  Critical: '#EF4444',
};

const styles = StyleSheet.create({
  page: { backgroundColor: '#0a0f12', color: '#f8fafc', fontFamily: 'Helvetica', padding: 20 },
  header: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  subHeader: { fontSize: 12, marginBottom: 5, color: '#9ca3af' },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  barContainer: { height: 10, backgroundColor: '#374151', borderRadius: 5, marginBottom: 5 },
  bar: { height: 10, borderRadius: 5 },
  textSmall: { fontSize: 10 },
});

export const ReportPDF = ({ report }) => {
  const { reportName, createdAt, severityLevel, aiAnalysis } = report;
  const dateStr = new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const metrics = aiAnalysis?.keyFindings || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{reportName}</Text>
        <Text style={styles.subHeader}>{dateStr} • Severity: {severityLevel}</Text>

        {/* AI Summary */}
        {aiAnalysis?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Summary</Text>
            <Text>{aiAnalysis.summary}</Text>
          </View>
        )}

        {/* Key Metrics */}
        {metrics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Health Markers</Text>
            {metrics.map((m, i) => {
              const color = SEV_COLORS[m.severity] || '#34D399';
              const percent = Math.min(100, Math.round((m.value / (m.maxValue || 100)) * 100));
              return (
                <View key={i} style={{ marginBottom: 5 }}>
                  <Text style={styles.textSmall}>{m.marker} ({m.value}{m.unit ? ` ${m.unit}` : ''})</Text>
                  <View style={styles.barContainer}>
                    <View style={{ ...styles.bar, width: `${percent}%`, backgroundColor: color }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Risk Factors */}
        {aiAnalysis?.riskFactors?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Factors</Text>
            {aiAnalysis.riskFactors.map((r, i) => <Text key={i} style={styles.textSmall}>• {r}</Text>)}
          </View>
        )}

        {/* Warning Signs */}
        {aiAnalysis?.warningSigns?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warning Signs</Text>
            {aiAnalysis.warningSigns.map((w, i) => <Text key={i} style={styles.textSmall}>• {w}</Text>)}
          </View>
        )}

        {/* Recommendations */}
        {aiAnalysis?.recommendations?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {aiAnalysis.recommendations.map((r, i) => <Text key={i} style={styles.textSmall}>{i+1}. {r}</Text>)}
          </View>
        )}

        {/* Disclaimer */}
        {aiAnalysis?.disclaimer && (
          <View style={styles.section}>
            <Text style={styles.textSmall}>{aiAnalysis.disclaimer}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};