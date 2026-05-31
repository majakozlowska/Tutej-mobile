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
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import AuthorRow from '../../components/AuthorRow';
import { COLORS } from '../../constants/theme';
import { sharedStyles } from '../../constants/sharedStyles';

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
        Linking.openURL(url).catch((err) => console.error(err));
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
            <TouchableOpacity style={sharedStyles.card} activeOpacity={0.9} onPress={() => setSelectedEvent(item)}>
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
            <View style={sharedStyles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={sharedStyles.screenContainer}>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={sharedStyles.listContent}
                ListHeaderComponent={
                    <ScreenHeader
                        title="Wydarzenia"
                        subtitle="Przeglądaj wydarzenia z okolicy"
                    />
                }
            />

            {selectedEvent && (() => {
                const { monthShort, dayNumeric, fullDateString, timeString } = formatDateHelpers(selectedEvent.date);
                return (
                    <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedEvent(null)}>
                        <View style={sharedStyles.modalContainer}>
                            <TouchableOpacity style={sharedStyles.backButton} onPress={() => setSelectedEvent(null)}>
                                <Ionicons name="chevron-back" size={28} color="#000000" />
                            </TouchableOpacity>

                            <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
                                <ModalHero
                                    imageUri={selectedEvent.image}
                                    title={selectedEvent.name}
                                    subtitle={selectedEvent.place}
                                />

                                <View style={styles.detailsContent}>
                                    <View style={styles.gridBoxes}>
                                        <View style={sharedStyles.gridBox}>
                                            <Text style={sharedStyles.gridBoxLabel}>KOSZT</Text>
                                            <Text style={sharedStyles.gridBoxValue}>
                                                {Number(selectedEvent.price) === 0 || !selectedEvent.price
                                                    ? 'Darmowe'
                                                    : `${selectedEvent.price} PLN`}
                                            </Text>
                                        </View>
                                        <View style={sharedStyles.gridBox}>
                                            <Text style={sharedStyles.gridBoxLabel}>CZAS</Text>
                                            <Text style={sharedStyles.gridBoxValue}>{selectedEvent.duration || 'N/A'}</Text>
                                        </View>
                                    </View>

                                    <View style={sharedStyles.section}>
                                        <Text style={sharedStyles.sectionHeader}>KIEDY</Text>
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

                                    <View style={sharedStyles.section}>
                                        <Text style={sharedStyles.sectionHeader}>ORGANIZATOR</Text>
                                        <AuthorRow
                                            photo={selectedEvent.author?.photo}
                                            firstName={selectedEvent.author?.firstName}
                                            lastName={selectedEvent.author?.lastName}
                                        />
                                    </View>

                                    <View style={sharedStyles.section}>
                                        <Text style={sharedStyles.sectionHeader}>OPIS</Text>
                                        <Text style={sharedStyles.descriptionBox}>{selectedEvent.description}</Text>
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
    modalScroll: {
        flexGrow: 1,
    },
    detailsContent: {
        padding: 20,
    },
    gridBoxes: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
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