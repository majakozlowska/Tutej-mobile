import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView,
    Linking,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import AuthorRow from '../../components/AuthorRow';
import MiniCalendar from '../../components/MiniCalendar';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import TextArea from '../../components/TextArea';
import ActionButton from '../../components/ActionButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants/theme';
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
    const { token, user } = useAuth();
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [place, setPlace] = useState('');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [imageBase64, setImageBase64] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

    const handleImageChange = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleAddEvent = async () => {
        if (!name.trim() || !description.trim() || !place.trim() || !date.trim() || !user?.id || !imageBase64) {
            return;
        }

        setSubmitting(true);
        try {
            const formattedDate = date.replace(' ', 'T');

            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    place: place.trim(),
                    date: formattedDate,
                    duration: duration.trim() || null,
                    price: price.trim() || null,
                    authorId: user.id,
                    image: imageBase64,
                }),
            });

            if (res.ok) {
                const newEvent = await res.json();
                setEvents([newEvent, ...events]);
                setShowForm(false);
                setName('');
                setDescription('');
                setPlace('');
                setDate('');
                setDuration('');
                setPrice('');
                setImageBase64('');
            } else {
                const errorData = await res.json();
                console.error(errorData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const openMap = (place: string) => {
        const url = `http://maps.google.com/?q=${encodeURIComponent(place)}`;
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
                                    <Ionicons name="people-outline" size={18} color={COLORS.darkGray} />
                                    <Text style={styles.metaText}>{item.attendees?.length || 0}</Text>
                                    <Text style={styles.dot}>·</Text>
                                    <Ionicons name="time-outline" size={18} color={COLORS.darkGray} />
                                    <Text style={styles.metaText}>{timeString}</Text>
                                </View>
                            </View>
                            <MiniCalendar month={monthShort} day={dayNumeric} />
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
                    <View>
                        <ScreenHeader
                            title="Wydarzenia"
                            subtitle="Przeglądaj wydarzenia z okolicy"
                        />
                        {showForm && (
                            <View style={styles.newPostForm}>
                                <InputField placeholder="Nazwa wydarzenia" icon="letters" value={name} onChange={setName} />
                                <InputField placeholder="Adres" icon="building" value={place} onChange={setPlace} />
                                <InputField placeholder="RRRR-MM-DD HH:SS" icon="date" value={date} onChange={setDate} />
                                <InputField placeholder="Cena (PLN) / puste (darmowe)" icon="price" value={price} onChange={setPrice} />
                                <InputField placeholder="Czas trwania" icon="duration" value={duration} onChange={setDuration} />
                                <TextArea placeholder="Opis wydarzenia..." value={description} onChange={setDescription} />
                                <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImageChange}>
                                    <ImagePlus size={24} color={COLORS.darkGray} />
                                    <Text style={styles.imageUploadText}>Dodaj okładkę</Text>
                                </TouchableOpacity>
                                <Button text={submitting ? "..." : "Opublikuj"} variant="primary" onClick={handleAddEvent} />
                            </View>
                        )}
                    </View>
                }
            />

            <View style={styles.fabContainer}>
                <ActionButton
                    variant={showForm ? "danger" : "primary"}
                    onClick={() => setShowForm(!showForm)}
                />
            </View>

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
                                            <MiniCalendar month={monthShort} day={dayNumeric} />
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
                                        <Text style={styles.descriptionBox}>{selectedEvent.description}</Text>
                                    </View>

                                    <Button
                                        text="Otwórz mapę Google"
                                        onClick={() => openMap(selectedEvent.place)}
                                    />
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
    fabContainer: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        zIndex: 1000,
    },
    newPostForm: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 20,
        borderWidth: 2,
        borderColor: COLORS.gray,
        marginBottom: 24,
        gap: 12,
    },
    imageUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: COLORS.gray,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.darkGray,
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 4,
    },
    imageUploadText: {
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        fontSize: 16,
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
        color: '#000000',
        marginBottom: 10,
        fontFamily: FONTS.heading,
    },
    belowTitle: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    location: {
        color: COLORS.darkGray,
        fontFamily: FONTS.regular,
        textTransform: 'uppercase',
        fontSize: 16,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    metaText: {
        marginLeft: 4,
        color: COLORS.darkGray,
        fontSize: 15,
        fontFamily: FONTS.regular,
    },
    dot: {
        marginHorizontal: 8,
        color: COLORS.darkGray,
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
        borderWidth: 2,
        borderColor: COLORS.gray,
        gap: 15,
    },
    whenDetails: {
        flex: 1,
    },
    fullDate: {
        fontSize: 15,
        color: '#000000',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    timeStr: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    descriptionBox: {
        fontFamily: FONTS.regular,
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray,
    },
imageUploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: COLORS.gray,
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 4,
    },
    imageUploadText: {
        color: COLORS.darkGray,
        fontSize: 16,
    },
    imagePreviewList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    imagePreviewItem: {
        width: 70,
        height: 70,
        borderRadius: 12,
        position: 'relative',
    },
    previewImg: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.white,
        borderRadius: 12,
    },
    imageWrapper: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});