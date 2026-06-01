import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import { COLORS } from '../../constants/theme';
import { sharedStyles } from '../../constants/sharedStyles';

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    photo: string | null;
    role: 'USER' | 'COUNCILLOR' | 'ADMIN';
}

interface NoticeData {
    id: number;
    title: string;
    content: string;
    media: string | null;
    createdAt: string;
    author: Author;
}

interface EventData {
    id: number;
    name: string;
    description: string;
    place: string;
    date: string;
    duration?: string;
    price?: number;
    image: string;
    authorId: number;
    author: {
        firstName: string;
        lastName: string;
        photo?: string;
    };
    attendees: Array<{
        id: number;
        firstName: string;
        photo?: string;
    }>;
}

export default function HomeScreen() {
    const [notice, setNotice] = useState<NoticeData | null>(null);
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noticesRes, eventsRes] = await Promise.all([
                    fetch(`${API_URL}/notices`),
                    fetch(`${API_URL}/events`),
                ]);

                if (noticesRes.ok) {
                    const noticesData = await noticesRes.json();
                    if (noticesData.length > 0) setNotice(noticesData[0]);
                }

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    if (eventsData.length > 0) setEvent(eventsData[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDateHelpers = (dateStr: string) => {
        const eventDate = new Date(dateStr);
        const monthShort = new Intl.DateTimeFormat('pl-PL', { month: 'short' })
            .format(eventDate)
            .replace('.', '')
            .toUpperCase();
        const dayNumeric = new Intl.DateTimeFormat('pl-PL', { day: '2-digit' }).format(eventDate);
        return { monthShort, dayNumeric };
    };

    return (
        <ScrollView style={sharedStyles.screenContainer} contentContainerStyle={styles.scrollContent} bounces={false}>
            <ScreenHeader
                title="Dzień dobry!"
                subtitle="Sprawdź, co nowego dzieje się w Twojej okolicy. Przeglądaj wydarzenia, oferty, ogłoszenia oraz porozmawiaj z innymi mieszkańcami na forum!"
            />

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Ładowanie podglądu...</Text>
                </View>
            ) : (
                <View style={styles.dashboardGrid}>
                    <View style={sharedStyles.section}>
                        <Text style={sharedStyles.sectionHeader}>Najnowsze ogłoszenie</Text>
                        {notice ? (
                            <View style={[sharedStyles.card, styles.homeCardPadding]}>
                                <Text style={styles.cardTitle}>{notice.title}</Text>
                                <Text style={styles.cardSnippet} numberOfLines={3}>{notice.content}</Text>
                                <View style={styles.cardFooter}>
                                    <Avatar
                                        photo={notice.author?.photo}
                                        firstName={notice.author?.firstName}
                                        lastName={notice.author?.lastName}
                                        size={32}
                                    />
                                    <Text style={styles.authorName}>
                                        {notice.author?.firstName} {notice.author?.lastName}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Brak nowych ogłoszeń.</Text>
                            </View>
                        )}
                    </View>

                    <View style={sharedStyles.section}>
                        <Text style={sharedStyles.sectionHeader}>Najbliższe wydarzenie</Text>
                        {event ? (
                            (() => {
                                const { monthShort, dayNumeric } = formatDateHelpers(event.date);
                                return (
                                    <View style={[sharedStyles.card, styles.homeCardPadding]}>
                                        <View style={styles.eventTopRow}>
                                            <Text style={[styles.cardTitle, { flex: 1 }]}>{event.name}</Text>
                                            <View style={styles.miniCalendar}>
                                                <Text style={styles.calMonth}>{monthShort}</Text>
                                                <Text style={styles.calDay}>{dayNumeric}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <Avatar
                                                photo={event.author?.photo}
                                                firstName={event.author?.firstName}
                                                lastName={event.author?.lastName}
                                                size={32}
                                            />
                                            <Text style={styles.authorName}>
                                                {event.author?.firstName} {event.author?.lastName}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })()
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Brak zaplanowanych wydarzeń.</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 15,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    dashboardGrid: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 10,
    },
    homeCardPadding: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
        lineHeight: 24,
    },
    cardSnippet: {
        fontSize: 14,
        color: '#7F8C8D',
        lineHeight: 20,
        marginBottom: 16,
    },
    eventTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
        gap: 10,
    },
    locationText: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 16,
    },
    miniCalendar: {
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 10,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 52,
        backgroundColor: COLORS.white,
    },
    calMonth: {
        color: '#2ECC71',
        fontWeight: '600',
        fontSize: 10,
        marginBottom: 1,
    },
    calDay: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        lineHeight: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderColor: '#ECF0F1',
        paddingTop: 12,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#7F8C8D',
    },
    emptyContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ECF0F1',
    },
    emptyText: {
        fontSize: 15,
        color: '#7F8C8D',
        fontWeight: '500',
        textAlign: 'center',
    },
});