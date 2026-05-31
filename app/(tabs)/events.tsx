import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView,
    Linking,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Heading from '../../components/Heading';
import { COLORS } from '../../constants/theme';

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
    attendees?: Array<{
        id: number;
        firstName: string;
        photo?: string;
    }>;
}

export default function EventsScreen() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/events`);
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const openMap = (place: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
        Linking.openURL(url).catch((err) => console.error("An error occurred", err));
    };

    const formatDateHelpers = (dateStr: string) => {
        const eventDate = new Date(dateStr);
        const monthShort = new Intl.DateTimeFormat('pl-PL', { month: 'short' })
            .format(eventDate)
            .replace('.', '')
            .toUpperCase();
        const dayNumeric = new Intl.DateTimeFormat('pl-PL', { day: '2-digit' }).format(eventDate);
        const fullDateString = new Intl.DateTimeFormat('pl-PL', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        }).format(eventDate);
        const timeString = new Intl.DateTimeFormat('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(eventDate);

        return { monthShort, dayNumeric, fullDateString, timeString };
    };

    const renderEventCard = ({ item }: { item: EventData }) => {
        const { monthShort, dayNumeric, timeString } = formatDateHelpers(item.date);

        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setSelectedEvent(item)}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.info}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.belowTitle}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.location} numberOfLines={1}>{item.place}</Text>
                                <View style={styles.meta}>
                                    <Ionicons name="people-outline" size={16} color="#7F8C8D" />
                                    <Text style={styles.metaText}>{item.attendees?.length || 0}</Text>
                                    <Text style={styles.dot}>·</Text>
                                    <Ionicons name="time-outline" size={16} color="#7F8C8D" />
                                    <Text style={styles.metaText}>{timeString}</Text>
                                </View>
                            </View>
                            <View style={styles.miniCalendar}>
                                <Text style={styles.calMonth}>{monthShort}</Text>
                                <Text style={styles.calDay}>{dayNumeric}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Heading text="Wydarzenia" />
                        <Text style={styles.subtitle}>Przeglądaj wydarzenia z okolicy</Text>
                    </View>
                }
            />

            {selectedEvent && (() => {
                const { monthShort, dayNumeric, fullDateString, timeString } = formatDateHelpers(selectedEvent.date);
                return (
                    <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedEvent(null)}>
                                <Ionicons name="chevron-back" size={28} color="#000000" />
                            </TouchableOpacity>

                            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
                                <View style={styles.heroSection}>
                                    <Image source={{ uri: selectedEvent.image }} style={styles.heroImage} />
                                    <View style={styles.heroOverlay} />
                                    <View style={styles.heroTextContainer}>
                                        <Text style={styles.heroTitle}>{selectedEvent.name}</Text>
                                        <Text style={styles.heroLocation}>{selectedEvent.place}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailsContent}>
                                    <View style={styles.gridBoxes}>
                                        <View style={styles.box}>
                                            <Text style={styles.boxLabel}>KOSZT</Text>
                                            <Text style={styles.boxValue}>
                                                {Number(selectedEvent.price) === 0 || !selectedEvent.price
                                                    ? 'Darmowe'
                                                    : `${selectedEvent.price} PLN`}
                                            </Text>
                                        </View>
                                        <View style={styles.box}>
                                            <Text style={styles.boxLabel}>CZAS</Text>
                                            <Text style={styles.boxValue}>{selectedEvent.duration || 'N/A'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionHeader}>KIEDY</Text>
                                        <View style={styles.whenRow}>
                                            <View style={styles.miniCalendarModal}>
                                                <Text style={styles.calMonth}>{monthShort}</Text>
                                                <Text style={styles.calDay}>{dayNumeric}</Text>
                                            </View>
                                            <View style={styles.whenDetails}>
                                                <Text style={styles.fullDate}>{fullDateString}</Text>
                                                <Text style={styles.timeStr}>{timeString}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionHeader}>ORGANIZATOR</Text>
                                        <View style={styles.hostRow}>
                                            <Image
                                                source={{
                                                    uri: selectedEvent.author?.photo ||
                                                        `https://ui-avatars.com/api/?name=${selectedEvent.author?.firstName}+${selectedEvent.author?.lastName}`
                                                }}
                                                style={styles.avatar}
                                            />
                                            <Text style={styles.hostName}>
                                                {selectedEvent.author?.firstName} {selectedEvent.author?.lastName}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.section}>
                                        <Text style={styles.sectionHeader}>OPIS</Text>
                                        <Text style={styles.description}>{selectedEvent.description}</Text>
                                    </View>

                                    <TouchableOpacity style={styles.mapButton} onPress={() => openMap(selectedEvent.place)}>
                                        <Ionicons name="map" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.mapButtonText}>Otwórz mapę Google</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </Modal>
                );
            })()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    listContent: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    subtitle: {
        color: '#7F8C8D',
        fontSize: 16,
        marginTop: 5,
    },
    card: {
        position: 'relative',
        borderWidth: 3,
        borderColor: '#ECF0F1',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        marginBottom: 25,
    },
    imageWrapper: {
        width: '100%',
        height: 180,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardBody: {
        padding: 20,
        flexDirection: 'row',
    },
    info: {
        flex: 1,
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 10,
    },
    belowTitle: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    location: {
        color: '#7F8C8D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 13,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    metaText: {
        marginLeft: 4,
        color: '#7F8C8D',
        fontSize: 14,
    },
    dot: {
        marginHorizontal: 8,
        color: '#7F8C8D',
    },
    miniCalendar: {
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 10,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        backgroundColor: COLORS.white,
    },
    calMonth: {
        color: '#2ECC71',
        fontWeight: '600',
        fontSize: 11,
        marginBottom: 2,
    },
    calDay: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        lineHeight: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9F9',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    modalScroll: {
        flexGrow: 1,
    },
    heroSection: {
        position: 'relative',
        height: 280,
        justifyContent: 'flex-end',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    heroTextContainer: {
        padding: 20,
        zIndex: 3,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 32,
        marginBottom: 6,
    },
    heroLocation: {
        fontSize: 15,
        color: '#E5E7E9',
        letterSpacing: 0.5,
    },
    detailsContent: {
        padding: 20,
    },
    gridBoxes: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    box: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    boxLabel: {
        color: '#7F8C8D',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    boxValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7F8C8D',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    whenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ECF0F1',
    },
    miniCalendarModal: {
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 10,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 65,
        backgroundColor: '#FAFAFA',
    },
    whenDetails: {
        marginLeft: 15,
        flex: 1,
    },
    fullDate: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    timeStr: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ECF0F1',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        resizeMode: 'cover',
    },
    hostName: {
        marginLeft: 15,
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
    },
    description: {
        fontSize: 15,
        color: '#2C3E50',
        lineHeight: 22,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ECF0F1',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34495E',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 30,
    },
    mapButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});