import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Alert, 
  Platform, 
  Share,
  ActivityIndicator,
  GestureResponderEvent
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Download, Calendar, Globe } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { formatCurrency } from '@/constants/formatters';
import { textToCents, centsToCurrency, textPercentToNumber } from '@/utils/money';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = useSettings();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Formato de fecha para visualización
  const formatDateForDisplay = useCallback((dateStr: string): string => {
    try {
      if (!dateStr) return '';
      
      // Si está en formato YYYY-MM-DD
      if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Si está en formato DDMMYYYY
      if (dateStr.length === 8) {
        return `${dateStr.slice(0, 2)}/${dateStr.slice(2, 4)}/${dateStr.slice(4)}`;
      }
      
      return dateStr;
    } catch {
      return dateStr;
    }
  }, []);

  const handleGenerateReport = useCallback(async (month: number) => {
    setShowMonthPicker(false);
    setIsLoading(true);
    
    try {
      await generateMonthReport(month, settings, formatDateForDisplay);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'No se pudo generar el reporte');
    } finally {
      setIsLoading(false);
    }
  }, [settings, formatDateForDisplay]);

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Generando reporte...</Text>
          </View>
        </View>
      )}

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Text style={styles.headerSubtitle}>Exporta y genera documentos</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/export-csv')}
          accessibilityRole="button"
          accessibilityLabel="Exportar servicios en formato CSV"
          disabled={isLoading}
        >
          <View style={styles.cardIcon}>
            <Download size={32} color="#4CAF50" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Exportar CSV</Text>
            <Text style={styles.cardDescription}>
              Descarga todos los servicios del año en formato CSV
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/generate-html')}
          accessibilityRole="button"
          accessibilityLabel="Generar reporte en formato HTML"
          disabled={isLoading}
        >
          <View style={styles.cardIcon}>
            <Globe size={32} color="#4CAF50" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Generar Reporte HTML</Text>
            <Text style={styles.cardDescription}>
              Crea un reporte profesional en formato HTML para imprimir o compartir
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowMonthPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Ver reportes de meses anteriores"
          disabled={isLoading}
        >
          <View style={styles.cardIcon}>
            <Calendar size={32} color="#4CAF50" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Reportes Anteriores</Text>
            <Text style={styles.cardDescription}>
              Genera reportes HTML de meses anteriores
            </Text>
          </View>
        </TouchableOpacity>

        <MonthPickerModal
          visible={showMonthPicker}
          onClose={() => setShowMonthPicker(false)}
          onSelectMonth={handleGenerateReport}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold', // ✅ Sin "as const"
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600', // ✅ Sin "as const"
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold', // ✅ Sin "as const"
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  monthButton: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    margin: 4,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600', // ✅ Sin "as const"
    color: '#6B7280',
  },
  modalCloseButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // ✅ Sin "as const"
  },
});

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMonth: (month: number) => void;
}

function MonthPickerModal({ visible, onClose, onSelectMonth }: MonthPickerModalProps) {
  // ✅ Tipo apropiado para el evento
  const handleOverlayPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View onStartShouldSetResponder={() => true}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Mes</Text>
            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.monthButton}
                  onPress={() => onSelectMonth(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar ${month}`}
                >
                  <Text style={styles.monthButtonText}>{month}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancelar selección"
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vtxu3dykdqnfq7dlmew6n';

// ✅ Función optimizada con mejor manejo de errores
async function generateMonthReport(
  month: number, 
  settings: any,
  formatDateForDisplay: (date: string) => string
) {
  const CURRENT_YEAR = new Date().getFullYear();
  const key = `taxi_services_${CURRENT_YEAR}_${month}`;
  
  try {
    const stored = await AsyncStorage.getItem(key);
    
    if (!stored) {
      Alert.alert('Sin datos', `No hay servicios registrados para ${MONTH_NAMES[month]}`);
      return;
    }

    const services = JSON.parse(stored);
    
    if (!Array.isArray(services) || services.length === 0) {
      Alert.alert('Sin datos', `No hay servicios registrados para ${MONTH_NAMES[month]}`);
      return;
    }

    // ✅ Cálculo optimizado de totales
    const totalsCalc = services.reduce((acc, service) => {
      const priceCents = textToCents(service.price) || 0;
      const discountNum = textPercentToNumber(service.discountPercent) || 0;
      const discountCents = Math.floor((priceCents * discountNum) / 100);
      const finalCents = priceCents - discountCents;
      
      return {
        totalPrice: acc.totalPrice + priceCents,
        totalDiscount: acc.totalDiscount + discountCents,
        totalFinal: acc.totalFinal + finalCents,
      };
    }, { totalPrice: 0, totalDiscount: 0, totalFinal: 0 });

    const totals = {
      totalPrice: centsToCurrency(totalsCalc.totalPrice),
      totalDiscount: centsToCurrency(totalsCalc.totalDiscount),
      totalFinal: centsToCurrency(totalsCalc.totalFinal),
    };

    const htmlContent = generateHTMLContent(
      services, 
      month, 
      CURRENT_YEAR, 
      settings, 
      totals,
      formatDateForDisplay
    );
    
    const fileName = `reporte_${MONTH_NAMES[month]}_${CURRENT_YEAR}.html`;

    if (Platform.OS === 'web') {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Alert.alert('Éxito', 'Reporte HTML descargado correctamente');
    } else {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Share.share({
        url: fileUri,
        title: `Reporte ${MONTH_NAMES[month]} ${CURRENT_YEAR}`,
      });

      Alert.alert('Éxito', 'Reporte generado y compartido correctamente');
    }
  } catch (error) {
    console.error('Error in generateMonthReport:', error);
    throw error;
  }
}

// ✅ Función mejorada para generar HTML con formato de fecha correcto
function generateHTMLContent(
  services: any[], 
  month: number, 
  year: number, 
  settings: any, 
  totals: any,
  formatDateForDisplay: (date: string) => string
) {
  const generatedDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ✅ Generar filas con formato de fecha correcto
  const servicesRows = services
    .map((service, index) => {
      const priceCents = textToCents(service.price) || 0;
      const discountNum = textPercentToNumber(service.discountPercent) || 0;
      const discountCents = Math.floor((priceCents * discountNum) / 100);
      const finalCents = priceCents - discountCents;

      const route = service.origin && service.destination 
        ? `${service.origin} → ${service.destination}` 
        : '-';
      
      const company = service.company || service.clientName || '-';
      
      // ✅ Formato de fecha correcto
      const formattedDate = formatDateForDisplay(service.date);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${formattedDate}</td>
          <td>${route}</td>
          <td style="padding-left: 4px;">${company}</td>
          <td class="right">${centsToCurrency(priceCents)}</td>
          <td class="right">${discountNum}%</td>
          <td class="right">${centsToCurrency(finalCents)}</td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte ${MONTH_NAMES[month]} ${year}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2d3748;
      line-height: 1.4;
      background: white;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 12mm 15mm;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 2px solid #4caf50;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #e5e7eb;
    }
    
    .company-info h1 {
      font-size: 16px;
      color: #2d3748;
      margin-bottom: 3px;
      fontWeight: bold;
    }
    
    .company-info p {
      font-size: 12px;
      color: #6b7280;
    }
    
    .report-title {
      text-align: right;
    }
    
    .report-title h2 {
      color: #4caf50;
      font-size: 18px;
      margin-bottom: 4px;
      fontWeight: bold;
    }
    
    .report-title p {
      color: #6b7280;
      font-size: 11px;
    }
    
    .info-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 18px;
      padding: 14px;
      background-color: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 3px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .info-value {
      font-size: 12px;
      color: #2d3748;
      font-weight: 600;
    }
    
    .services-section {
      margin-bottom: 18px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10px;
    }
    
    thead {
      background-color: #f3f4f6;
    }
    
    th {
      padding: 8px 6px;
      text-align: left;
      font-size: 9px;
      font-weight: bold;
      color: #374151;
      text-transform: uppercase;
      border-bottom: 1px solid #d1d5db;
      border-top: 1px solid #d1d5db;
      letter-spacing: 0.3px;
    }
    
    th.right {
      text-align: right;
    }
    
    td {
      padding: 7px 6px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 10px;
    }
    
    td.right {
      text-align: right;
    }
    
    tr:last-child td {
      border-bottom: 1px solid #d1d5db;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 14px;
      background-color: #f9fafb;
      border-radius: 6px;
      margin-bottom: 14px;
      border: 1px solid #e5e7eb;
    }
    
    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .summary-label {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .summary-value {
      font-size: 13px;
      font-weight: bold;
      color: #1f2937;
    }
    
    .summary-value.discount {
      color: #ef4444;
    }
    
    .summary-total {
      padding: 10px 14px;
      background-color: #4caf50;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .summary-total .summary-label {
      color: #ffffff;
      font-size: 10px;
    }
    
    .summary-total .summary-value {
      color: #ffffff;
      font-size: 18px;
    }
    
    .footer {
      text-align: center;
      padding-top: 12px;
      margin-top: 12px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 9px;
    }
    
    @media screen {
      body {
        background-color: #f3f4f6;
        padding: 20mm;
      }
      
      .container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 15mm 20mm;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      
      .container {
        box-shadow: none;
        max-width: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
      }
      
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      .header {
        margin-bottom: 20px;
      }
      
      .info-section {
        margin-bottom: 20px;
      }
      
      .services-section {
        margin-bottom: 20px;
      }
      
      .header, .info-section, .summary {
        page-break-inside: avoid;
      }
      
      @page {
        margin: 15mm 20mm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-section">
        <img src="${LOGO_URL}" alt="Logo" class="logo" />
        <div class="company-info">
          <h1>${settings.cooperativeName || 'Servicio de Taxi'}</h1>
          <p>${settings.vehicleId || 'N/A'}</p>
        </div>
      </div>
      <div class="report-title">
        <h2>Reporte de ${MONTH_NAMES[month]} ${year}</h2>
        <p>Reporte Mensual</p>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-item">
        <span class="info-label">Conductor</span>
        <span class="info-value">${settings.userName || 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Servicios</span>
        <span class="info-value">${services.length}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Fecha Generación</span>
        <span class="info-value">${generatedDate}</span>
      </div>
    </div>
    
    <div class="services-section">
      <h3 class="section-title">Detalle de Servicios</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Ruta</th>
            <th style="padding-left: 4px;">Cliente</th>
            <th class="right">Precio</th>
            <th class="right">Desc.</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${servicesRows}
        </tbody>
      </table>
    </div>
    
    <div class="summary">
      <div class="summary-item">
        <span class="summary-label">Total Servicios:</span>
        <span class="summary-value">${services.length}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Ingresos Brutos:</span>
        <span class="summary-value">${totals.totalPrice}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Descuentos:</span>
        <span class="summary-value discount">-${totals.totalDiscount}</span>
      </div>
      <div class="summary-total">
        <span class="summary-label">Total Neto:</span>
        <span class="summary-value">${totals.totalFinal}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>Generado el ${generatedDate}</p>
    </div>
  </div>
</body>
</html>`;
}