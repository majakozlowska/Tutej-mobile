import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import AuthorRow from '../../components/AuthorRow';
import { COLORS, FONTS } from '../../constants/theme';
import { sharedStyles } from '../../constants/sharedStyles';

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
            <TouchableOpacity style={sharedStyles.card} activeOpacity={0.9} onPress={() => setSelectedListing(item)}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: mainImage }} style={styles.cardImage} />

                    <View style={[styles.statusBadge, styles[item.status.toLowerCase()]]}>
                        <View style={[styles.statusDot, item.status === 'AVAILABLE' ? styles.dotAvailable : styles.dotReserved]} />
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
        <View style={sharedStyles.screenContainer}>
            {loading ? (
                <View style={sharedStyles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary || '#3498DB'} />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderListingCard}
                    contentContainerStyle={sharedStyles.listContent}
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
                    <View style={sharedStyles.modalContainer}>
                        <TouchableOpacity style={sharedStyles.backButton} onPress={() => setSelectedListing(null)}>
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
                                    <View style={sharedStyles.gridBox}>
                                        <Text style={sharedStyles.gridBoxLabel}>CENA</Text>
                                        <Text style={sharedStyles.gridBoxValue}>{getPriceString(selectedListing.price)}</Text>
                                    </View>
                                    <View style={sharedStyles.gridBox}>
                                        <Text style={sharedStyles.gridBoxLabel}>KONTAKT</Text>
                                        <Text style={[sharedStyles.gridBoxValue, styles.contactValue]} numberOfLines={2}>
                                            {selectedListing.contact}
                                        </Text>
                                    </View>
                                </View>

                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>OPIS</Text>
                                    <Text style={sharedStyles.descriptionBox}>{selectedListing.description}</Text>
                                </View>

                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>OGŁOSZENIODAWCA</Text>
                                    <AuthorRow
                                        photo={selectedListing.author.photo}
                                        firstName={selectedListing.author.firstName}
                                        lastName={selectedListing.author.lastName}
                                    />
                                </View>

                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>GALERIA</Text>
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
    statusDot: {
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
        fontFamily: FONTS.heading,
        color: '#000000',
        marginBottom: 5,
    },
    authorName: {
        fontSize: 15,
        color: '#7F8C8D',
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
    contactValue: {
        fontSize: 14,
        textAlign: 'center',
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
        borderColor: '#ECF0F1',
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