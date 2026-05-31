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
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import { COLORS } from '../../constants/theme';

interface ListingImage {
    id: number;
    url: string;
}

interface ListingData {
    id: number;
    title: string;
    description: string;
    price: string | null;
    contact: string;
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
    createdAt: string;
    authorId: number;
    author: {
        firstName: string;
        lastName: string;
        photo?: string;
    };
    images: ListingImage[];
}

export default function TradeScreen() {
    const [listings, setListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/listings`);
            const data = await res.json();
            setListings(data.filter((item: ListingData) => item.status !== 'SOLD'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const getPriceString = (priceVal: any) => {
        if (!priceVal || parseFloat(priceVal.toString()) === 0) return 'Darmowe';
        return `${parseFloat(priceVal.toString()).toLocaleString('pl-PL')} PLN`;
    };

    const renderListingCard = ({ item }: { item: ListingData }) => {
        const mainImage = item.images && item.images.length > 0 ? item.images[0].url : 'https://via.placeholder.com/150';

        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setSelectedListing(item)}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: mainImage }} style={styles.cardImage} />

                    <View style={[styles.statusBadge, styles[item.status.toLowerCase()]]}>
                        <View style={[styles.dot, item.status === 'AVAILABLE' ? styles.dotAvailable : styles.dotReserved]} />
                        <Text style={styles.statusText}>
                            {item.status === 'AVAILABLE' ? 'Dostępne' : 'Zarezerwowane'}
                        </Text>
                    </View>

                    <View style={styles.priceTagContainer}>
                        <View style={styles.priceTagButton}>
                            <Text style={styles.priceTagText}>{getPriceString(item.price)}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.authorName}>{item.author.firstName} {item.author.lastName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary || '#3498DB'} />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderListingCard}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <ScreenHeader
                            title="Giełda sąsiedzka"
                            subtitle="Przeglądaj oferty zamieszczone przez mieszkańców"
                        />
                    }
                />
            )}

            {selectedListing && (
                <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedListing(null)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedListing(null)}>
                            <Ionicons name="chevron-back" size={28} color="#000000" />
                        </TouchableOpacity>

                        <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
                            <ModalHero
                                imageUri={selectedListing.images[0]?.url || 'https://via.placeholder.com/150'}
                                title={selectedListing.title}
                                subtitle={selectedListing.status === 'AVAILABLE' ? 'Dostępne' : 'Zarezerwowane'}
                            />

                            <View style={styles.detailsContent}>
                                <View style={styles.gridBoxes}>
                                    <View style={styles.box}>
                                        <Text style={styles.boxLabel}>CENA</Text>
                                        <Text style={styles.boxValue}>{getPriceString(selectedListing.price)}</Text>
                                    </View>
                                    <View style={styles.box}>
                                        <Text style={styles.boxLabel}>KONTAKT</Text>
                                        <Text style={[styles.boxValue, styles.contactValue]} numberOfLines={2}>
                                            {selectedListing.contact}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>OPIS</Text>
                                    <Text style={styles.description}>{selectedListing.description}</Text>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>OGŁOSZENIODAWCA</Text>
                                    <View style={styles.hostRow}>
                                        <Image
                                            source={{
                                                uri: selectedListing.author.photo ||
                                                    `https://ui-avatars.com/api/?name=${selectedListing.author.firstName}+${selectedListing.author.lastName}`
                                            }}
                                            style={styles.avatar}
                                        />
                                        <Text style={styles.hostName}>
                                            {selectedListing.author.firstName} {selectedListing.author.lastName}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>GALERIA</Text>
                                    <View style={styles.galleryGrid}>
                                        {selectedListing.images && selectedListing.images.map((img, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.galleryItem}
                                                onPress={() => setZoomedImage(img.url)}
                                            >
                                                <Image source={{ uri: img.url }} style={styles.galleryImage} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}

            <Modal visible={zoomedImage !== null} transparent={true} animationType="fade" onRequestClose={() => setZoomedImage(null)}>
                <TouchableOpacity style={styles.lightbox} activeOpacity={1} onPress={() => setZoomedImage(null)}>
                    <View style={styles.lightboxContent}>
                        {zoomedImage && <Image source={{ uri: zoomedImage }} style={styles.lightboxImage} />}
                    </View>
                </TouchableOpacity>
            </Modal>
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
    },
    listContent: {
        padding: 20,
    },
    card: {
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
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    statusBadge: {
        position: 'absolute',
        top: 15,
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderWidth: 1,
        borderColor: '#ECF0F1',
    },
    available: {
        borderColor: '#2ECC71',
    },
    reserved: {
        borderColor: '#F1C40F',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotAvailable: {
        backgroundColor: '#2ECC71',
    },
    dotReserved: {
        backgroundColor: '#F1C40F',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 6,
    },
    priceTagContainer: {
        position: 'absolute',
        bottom: -15,
        right: 20,
    },
    priceTagButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        elevation: 3,
    },
    priceTagText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000000',
    },
    cardBody: {
        padding: 25,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 5,
    },
    authorName: {
        fontSize: 15,
        color: '#7F8C8D',
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
        elevation: 3,
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
    box: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        elevation: 2,
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
        marginBottom: 30,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7F8C8D',
        letterSpacing: 1.2,
        marginBottom: 12,
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
    },
    hostName: {
        marginLeft: 15,
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    galleryItem: {
        width: (Dimensions.get('window').width - 60) / 3,
        aspectRatio: 4 / 3,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#7F8C8D',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    lightbox: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxContent: {
        width: '95%',
        height: '80%',
    },
    lightboxImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});