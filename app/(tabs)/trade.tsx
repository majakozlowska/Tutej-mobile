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
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import AuthorRow from '../../components/AuthorRow';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import TextArea from '../../components/TextArea';
import ActionButton from '../../components/ActionButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants/theme';
import { sharedStyles } from '../../constants/sharedStyles';
import { ImagePlus } from 'lucide-react-native';

const IconComponent = ImagePlus;

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
    const { token, user } = useAuth();
    const [listings, setListings] = useState<ListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [contact, setContact] = useState('');
    const [imagesBase64, setImagesBase64] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/listings`);
            const data = await res.json();
            setListings(data.filter((item: ListingData) => item.status !== 'SOLD'));
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleImageChange = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setImagesBase64((prev) => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
        }
    };

    const removeImage = (index: number) => {
        setImagesBase64((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddListing = async () => {
        if (!title.trim() || !description.trim() || !contact.trim() || !user?.id || imagesBase64.length === 0) {
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/listings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    price: price.trim() ? parseFloat(price) : null,
                    contact: contact.trim(),
                    authorId: user.id,
                    images: imagesBase64,
                }),
            });

            if (res.ok) {
                const newListing = await res.json();
                setListings([newListing, ...listings]);
                setShowForm(false);
                setTitle('');
                setDescription('');
                setPrice('');
                setContact('');
                setImagesBase64([]);
            }
        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

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

                    <View style={[styles.statusBadge, styles[item.status.toLowerCase() as keyof typeof styles]]}>
                        <View style={[styles.statusDot, item.status === 'AVAILABLE' ? styles.dotAvailable : styles.dotReserved]} />
                        <Text style={styles.statusText}>
                            {item.status === 'AVAILABLE' ? 'Dostępne' : 'Zarezerwowane'}
                        </Text>
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={styles.priceShadowWrapper}>
                            <LinearGradient colors={[COLORS.white, COLORS.gray]} style={styles.priceBorderGradient}>
                                <LinearGradient colors={[COLORS.gray, COLORS.white]} style={styles.priceInnerGradient}>
                                    <Text style={styles.priceText}>{getPriceString(item.price)}</Text>
                                </LinearGradient>
                            </LinearGradient>
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

    if (loading) {
        return (
            <View style={sharedStyles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </View>
        );
    }

    return (
        <View style={sharedStyles.screenContainer}>
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderListingCard}
                contentContainerStyle={sharedStyles.listContent}
                ListHeaderComponent={
                    <View>
                        <ScreenHeader
                            title="Giełda sąsiedzka"
                            subtitle="Przeglądaj oferty zamieszczone przez mieszkańców"
                        />

                        {showForm && (
                            <View style={styles.newPostForm}>
                                <InputField placeholder="Tytuł ogłoszenia" icon="letters" value={title} onChange={setTitle} />
                                <InputField placeholder="Cena (PLN)" icon="price" value={price} onChange={setPrice} />
                                <InputField placeholder="Kontakt" icon="contact" value={contact} onChange={setContact} />
                                <TextArea placeholder="Opis ogłoszenia..." value={description} onChange={setDescription} />

                                <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImageChange}>
                                    <IconComponent size={24} color={COLORS.darkGray} strokeWidth={2} />
                                    <Text style={styles.imageUploadText}>Dodaj zdjęcie</Text>
                                </TouchableOpacity>

                                {imagesBase64.length > 0 && (
                                    <View style={styles.imagePreviewList}>
                                        {imagesBase64.map((src, idx) => (
                                            <View key={idx} style={styles.imagePreviewItem}>
                                                <Image source={{ uri: src }} style={styles.previewImg} />
                                                <TouchableOpacity onPress={() => removeImage(idx)} style={styles.removeBtn}>
                                                    <Ionicons name="close-circle" size={22} color={COLORS.green} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <Button text={submitting ? "..." : "Opublikuj"} variant="primary" onClick={handleAddListing} />
                            </View>
                        )}
                    </View>
                }
            />

            <View style={styles.fabContainer}>
                <ActionButton
                    icon={showForm ? "close" : "add"}
                    variant={showForm ? "danger" : "primary"}
                    onClick={() => setShowForm(!showForm)}
                />
            </View>

            {selectedListing && (
                <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedListing(null)}>
                    <View style={sharedStyles.modalContainer}>
                        <TouchableOpacity style={sharedStyles.backButton} onPress={() => setSelectedListing(null)}>
                            <Ionicons name="chevron-back" size={28} color={COLORS.black} />
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
                                        <Text style={sharedStyles.gridBoxValue} numberOfLines={2}>
                                            {selectedListing.contact}
                                        </Text>
                                    </View>
                                </View>

                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>OPIS</Text>
                                    <Text style={styles.descriptionBox}>{selectedListing.description}</Text>
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
                                            <TouchableOpacity key={index} style={styles.galleryItem} onPress={() => setZoomedImage(img.url)}>
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
        borderRadius: 11,
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
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
    },
    available: {
        borderColor: COLORS.green,
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
        backgroundColor: COLORS.green,
    },
    dotReserved: {
        backgroundColor: '#F1C40F',
    },
    statusText: {
        fontSize: 13,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        marginLeft: 6,
        marginBottom: 5,
    },
    priceContainer: {
        position: 'absolute',
        bottom: -15,
        right: 20,
        backgroundColor: COLORS.gray,
        padding: 3,
        borderRadius: 14,
    },
    priceShadowWrapper: {
        borderRadius: 11,
        elevation: 6,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    priceBorderGradient: {
        padding: 2,
        borderRadius: 11,
    },
    priceInnerGradient: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    priceText: {
        fontFamily: FONTS.heading,
        fontSize: 16,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 5,
    },
    cardBody: {
        padding: 25,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        marginBottom: 5,
    },
    authorName: {
        fontSize: 15,
        fontFamily: FONTS.regular,
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
    headingFont: {
        fontFamily: FONTS.heading,
    },
    contactValue: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
    descriptionBox: {
        fontFamily: FONTS.regular,
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
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
        borderColor: COLORS.gray,
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