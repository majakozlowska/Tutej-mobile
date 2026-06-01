import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import MiniCalendar from '../../components/MiniCalendar';
import { COLORS, FONTS } from '../../constants/theme';
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

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
                subtitle="Sprawdź, co dzieje się w Twojej okolicy!"
            />

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <View style={styles.dashboardGrid}>
                    <View style={sharedStyles.section}>
                        <Text style={styles.sectionHeader}>Najnowsze ogłoszenie</Text>
                        {notice ? (
                            <View style={[sharedStyles.card, styles.cardPadding]}>
                                <Text style={styles.cardTitle}>{notice.title}</Text>
                                <Text style={styles.cardSnippet} numberOfLines={3}>{notice.content}</Text>
                                <View style={styles.cardFooter}>
                                    <View style={styles.authorRow}>
                                        <Avatar
                                            photo={notice.author?.photo}
                                            firstName={notice.author?.firstName}
                                            lastName={notice.author?.lastName}
                                            size={36}
                                        />
                                        <Text style={styles.authorName}>
                                            {notice.author?.firstName} {notice.author?.lastName}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Brak ogłoszeń.</Text>
                            </View>
                        )}
                    </View>

                    <View style={sharedStyles.section}>
                        <Text style={styles.sectionHeader}>Najbliższe wydarzenie</Text>
                        {event ? (
                            (() => {
                                const { monthShort, dayNumeric } = formatDateHelpers(event.date);
                                return (
                                    <View style={[sharedStyles.card, styles.cardPadding]}>
                                        <View style={styles.eventRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardTitle}>{event.name}</Text>
                                                <Text style={styles.location}>{event.place}</Text>
                                            </View>
                                            <MiniCalendar month={monthShort} day={dayNumeric} />
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <View style={styles.authorRow}>
                                                <Avatar
                                                    photo={event.author?.photo}
                                                    firstName={event.author?.firstName}
                                                    lastName={event.author?.lastName}
                                                    size={36}
                                                />
                                                <Text style={styles.authorName}>
                                                    {event.author?.firstName} {event.author?.lastName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })()
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Brak wydarzeń.</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    dashboardGrid: {
        gap: 0,
        marginTop: 12,
    },
    cardPadding: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: '#000000',
        marginBottom: 8,
    },
    cardSnippet: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        lineHeight: 22,
        marginBottom: 16,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    location: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: COLORS.gray,
        paddingTop: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    authorName: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
    },
    emptyContainer: {
        backgroundColor: COLORS.white,
        padding: 24,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.gray,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
    },
    sectionHeader: {
        fontSize: 15,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginBottom: 12,
        marginTop: -26,
    },
});