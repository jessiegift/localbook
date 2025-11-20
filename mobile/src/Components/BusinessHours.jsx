import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BusinessHours = ({ business }) => {
  // ✅ DEBUG: Log what we receive
  console.log('=== BUSINESS HOURS DEBUG ===');
  console.log('Business object:', business);
  console.log('operatingHours value:', business?.operatingHours);
  console.log('operatingHours type:', typeof business?.operatingHours);
  
  // Parse operating hours from JSON string
  const getOperatingHours = () => {
    if (!business?.operatingHours) {
      console.log('❌ No operatingHours field found');
      return null;
    }

    try {
      const parsed = JSON.parse(business.operatingHours);
      console.log('✅ Successfully parsed hours:', parsed);
      return parsed;
    } catch (e) {
      console.error('❌ Could not parse operating hours:', e);
      console.error('Raw value was:', business.operatingHours);
      return null;
    }
  };

  // Get current day name
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  // Check if business is currently open
  const isOpenNow = () => {
    const hours = getOperatingHours();
    if (!hours) return false;

    const currentDay = getCurrentDay();
    const todayHours = hours[currentDay];

    if (!todayHours || !todayHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  // Get today's hours
  const getTodayHours = () => {
    const hours = getOperatingHours();
    if (!hours) return null;

    const currentDay = getCurrentDay();
    return hours[currentDay];
  };

  // Format time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  const hours = getOperatingHours();
  const todayHours = getTodayHours();
  const isOpen = isOpenNow();

  if (!hours) {
    // ✅ SHOW DEBUG MESSAGE INSTEAD OF HIDING
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 22 }}>🕐</Text>
          </View>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
        </View>
        
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>⚠️ Debug Info:</Text>
          <Text style={styles.debugText}>
            Business ID: {business?.id || 'N/A'}
          </Text>
          <Text style={styles.debugText}>
            operatingHours field: {business?.operatingHours === null ? 'null' : business?.operatingHours === undefined ? 'undefined' : `"${business?.operatingHours}"`}
          </Text>
          <Text style={styles.debugText}>
            Type: {typeof business?.operatingHours}
          </Text>
          <Text style={[styles.debugText, { marginTop: 12, color: '#DC2626', fontWeight: '700' }]}>
            Hours not set yet!
          </Text>
          <Text style={styles.debugHelp}>
            Business owner needs to set hours in web dashboard (Settings → Business Hours)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Open/Closed Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
          <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
          <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </Text>
        </View>
        
        {todayHours && todayHours.enabled && (
          <Text style={styles.todayHoursText}>
            Today: {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
          </Text>
        )}
        {todayHours && !todayHours.enabled && (
          <Text style={styles.todayHoursText}>Closed today</Text>
        )}
      </View>

      {/* Weekly Hours */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 22 }}>🕐</Text>
        </View>
        <Text style={styles.sectionTitle}>Opening Hours</Text>
      </View>
      
      <View style={styles.hoursContainer}>
        {Object.keys(hours).map((day) => {
          const dayHours = hours[day];
          const isToday = day === getCurrentDay();

          return (
            <View
              key={day}
              style={[
                styles.dayRow,
                isToday && styles.todayRow
              ]}
            >
              <Text style={[styles.dayName, isToday && styles.todayText]}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
                {isToday && ' (Today)'}
              </Text>
              <Text style={[styles.dayTime, isToday && styles.todayText]}>
                {dayHours.enabled
                  ? `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
                  : 'Closed'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  openBadge: {
    backgroundColor: '#D1FAE5',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  openDot: {
    backgroundColor: '#10B981',
  },
  closedDot: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  openText: {
    color: '#047857',
  },
  closedText: {
    color: '#DC2626',
  },
  todayHoursText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  hoursContainer: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  todayRow: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dayName: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  dayTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  todayText: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  // ✅ DEBUG STYLES
  debugContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 13,
    color: '#78350F',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  debugHelp: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default BusinessHours;