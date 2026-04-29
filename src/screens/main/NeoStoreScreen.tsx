import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius, Shadow, Colors } from '../../theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BuildBundleModal from '../../components/modals/BuildBundleModal';
import ListItemModal from '../../components/modals/ListItemModal';
import { bundles, p2pItems, bundleCatalog, Product, BundleItem } from '../../data/neostore';
import { useP2PListings, UserListing } from '../../hooks/useP2PListings';
import Icon from '../../components/icons/Icon';

const SHOP_CATEGORIES = ['Feeding', 'Clothing', 'Hygiene', 'Health', 'Comfort', 'Sleep'] as const;

// ── Auto-sliding image carousel ────────────────────────────────────────────────
function ImageCarousel({ images, height }: { images: string[]; height: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  return (
    <View
      style={{ height, overflow: 'hidden' }}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={images.length > 1}
        onMomentumScrollEnd={e => {
          if (containerWidth > 0) {
            setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / containerWidth));
          }
        }}
      >
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={{ width: containerWidth, height }} resizeMode="cover" />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.carouselDots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.carouselDot, i === activeIndex && styles.carouselDotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function NeoStoreScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const {
    wishlist, addToWishlist, removeFromWishlist,
    cart, customBundle,
    addToCart: ctxAddToCart,
    removeFromCart: ctxRemoveFromCart,
    setCustomBundle,
  } = useAppContext();

  const isWishlisted = (id: string) => wishlist.some(w => w.id === id);

  const toggleWishlist = (product: Product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        tag: product.tag,
      });
    }
  };

  const HERO_TEXT   = [theme.accent.rose.text, theme.accent.peach.text, theme.accent.sage.text, theme.accent.gold.text];
  const AVATAR_COLORS = [theme.accent.rose.bg, theme.accent.sky.bg, theme.accent.sage.bg, theme.accent.gold.bg, theme.accent.peach.bg];

  const { listings: myListings, addListing, removeListing } = useP2PListings();

  const [activeSection, setActiveSection] = useState<'shop' | 'bundles' | 'p2p'>('shop');
  const [p2pView, setP2pView] = useState<'browse' | 'mine'>('browse');
  const [activeShopCat, setActiveShopCat] = useState<string>('All');
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [buildBundleVisible, setBuildBundleVisible] = useState(false);
  const [listItemVisible, setListItemVisible] = useState(false);

  const conditionLabel = (c: UserListing['condition']) =>
    c === 'like-new' ? 'Like new' : c === 'good' ? 'Good' : 'Fair';

  const confirmRemoveListing = (id: string) => {
    Alert.alert('Remove listing', 'Remove this item from P2P?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeListing(id) },
    ]);
  };

  const formatPrice = (p: Product) =>
    p.price === 0 ? 'Custom pricing' : `${p.currency}${p.price.toLocaleString()}`;

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0) + (customBundle ? 1 : 0);
  const cartTotal = (() => {
    const allProducts = [...bundles, ...p2pItems];
    const regular = Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = allProducts.find(p => p.id === id);
      if (product) {
        return sum + (product.p2p ? (product.logisticsPrice ?? 0) : product.price) * qty;
      }
      const shopItem = bundleCatalog.find(i => i.id === id);
      if (shopItem) return sum + shopItem.price * qty;
      return sum;
    }, 0);
    return regular + (customBundle?.total ?? 0);
  })();
  const cartCurrency = '₦';

  const addToCart = (p: Product) => ctxAddToCart(p.id);
  const decreaseQty = (p: Product) => ctxRemoveFromCart(p.id);
  const addShopItem = (id: string) => ctxAddToCart(id);
  const removeShopItem = (id: string) => ctxRemoveFromCart(id);

  const toggleShopItemWishlist = (item: BundleItem) => {
    if (isWishlisted(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        name: item.name,
        description: item.category,
        price: item.price,
        currency: '₦',
      });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedBundles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCheckout = () => navigation.navigate('Cart');

  const InCartPill = ({ onPress, label = '✓ In cart' }: { onPress: () => void; label?: string }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.inCartPill, { backgroundColor: theme.accent.sage.bg, borderColor: theme.accent.sage.border }]}
    >
      <Text style={[styles.inCartPillText, { color: theme.accent.sage.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.bg.app }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, cartCount > 0 && { paddingBottom: Spacing[24] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
          >
            <Icon name="left" size={20} color={theme.text.primary} />
            <Text style={[styles.backLabel, { color: theme.text.primary }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Wishlist')}
              activeOpacity={0.8}
              style={[styles.wishlistIconBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
            >
              <Icon name="heart" size={18} color={wishlist.length > 0 ? Colors.accent.rose.text : theme.text.secondary} />
              {wishlist.length > 0 && (
                <View style={[styles.wishlistBadge, { backgroundColor: Colors.accent.rose.text }]}>
                  <Text style={styles.wishlistBadgeText}>{wishlist.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.8}
              style={[styles.wishlistIconBtn, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}
            >
              <Icon name="shopping_cart_1" size={18} color={cartCount > 0 ? theme.text.brand : theme.text.secondary} />
              {cartCount > 0 && (
                <View style={[styles.wishlistBadge, { backgroundColor: theme.interactive.primary }]}>
                  <Text style={styles.wishlistBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>NeoStore</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Curated essentials for your baby and pregnancy journey.
          </Text>
        </View>

        {/* Section toggle */}
        <View style={[styles.segmented, { backgroundColor: theme.bg.subtle }]}>
          {([
            { key: 'shop',    label: '🛍️ Shop'    },
            { key: 'bundles', label: '📦 Bundles' },
            { key: 'p2p',     label: '🤝 P2P'     },
          ] as const).map(s => (
            <TouchableOpacity
              key={s.key}
              onPress={() => setActiveSection(s.key)}
              style={[
                styles.segment,
                activeSection === s.key && [styles.segmentActive, { backgroundColor: theme.bg.surface, ...Shadow.sm }],
              ]}
            >
              <Text style={[
                styles.segmentLabel,
                { color: activeSection === s.key ? theme.text.brand : theme.text.tertiary },
              ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === 'bundles' ? (
          <View style={styles.productList}>
            {bundles.map(b => {
              const expanded = expandedBundles.has(b.id);
              const hasItems = b.items && b.items.length > 0;
              return (
                <Card key={b.id} style={styles.productCard} padding="none">
                  {/* Image carousel */}
                  <View style={styles.carouselWrap}>
                    <ImageCarousel images={b.images ?? []} height={180} />
                    <TouchableOpacity
                      onPress={() => toggleWishlist(b)}
                      activeOpacity={0.7}
                      style={[styles.carouselHeartBtn, { backgroundColor: theme.bg.surface }]}
                    >
                      <Icon name="heart" size={16} color={isWishlisted(b.id) ? Colors.accent.rose.text : theme.text.tertiary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBody}>
                    {b.tag && (
                      <View style={[styles.bundleTag, { backgroundColor: theme.accent.rose.bg }]}>
                        <Text style={[styles.bundleTagText, { color: theme.accent.rose.text }]}>{b.tag}</Text>
                      </View>
                    )}
                    <Text style={[styles.cardName, { color: theme.text.primary }]}>{b.name}</Text>
                    <Text
                      style={[styles.cardDesc, { color: theme.text.secondary }]}
                      numberOfLines={expanded ? undefined : 2}
                    >
                      {b.description}
                    </Text>

                    {expanded && hasItems && (
                      <View style={styles.itemList}>
                        {b.items!.map(item => (
                          <View key={item} style={styles.itemRow}>
                            <Text style={[styles.itemDot, { color: theme.text.brand }]}>•</Text>
                            <Text style={[styles.itemText, { color: theme.text.secondary }]}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {hasItems && (
                      <TouchableOpacity onPress={() => toggleExpanded(b.id)} activeOpacity={0.7} style={styles.readMoreBtn}>
                        <Text style={[styles.readMoreLabel, { color: theme.text.brand }]}>
                          {expanded
                            ? 'Hide details ↑'
                            : `See what's included (${b.items!.length} items) →`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={[styles.cardFooter, { borderTopColor: theme.border.subtle }]}>
                      {b.id === 'bundle-custom' ? (
                        customBundle ? (
                          <>
                            <View>
                              <Text style={[styles.price, { color: theme.text.primary }]}>
                                ₦{customBundle.total.toLocaleString()}
                              </Text>
                              <Text style={[styles.customBundleMeta, { color: theme.text.tertiary }]}>
                                {Object.values(customBundle.selection).reduce((s, q) => s + q, 0)} item{Object.values(customBundle.selection).reduce((s, q) => s + q, 0) !== 1 ? 's' : ''} selected
                              </Text>
                            </View>
                            <Button label="Edit bundle" onPress={() => setBuildBundleVisible(true)} size="sm" variant="secondary" />
                          </>
                        ) : (
                          <>
                            <Text style={[styles.price, { color: theme.text.secondary }]}>Custom pricing</Text>
                            <Button label="Build bundle" onPress={() => setBuildBundleVisible(true)} size="sm" />
                          </>
                        )
                      ) : (
                        <>
                          <Text style={[styles.price, { color: theme.text.primary }]}>{formatPrice(b)}</Text>
                          {cart[b.id] ? (
                            <InCartPill onPress={() => navigation.navigate('Cart')} />
                          ) : (
                            <Button label="Add to cart" onPress={() => addToCart(b)} size="sm" />
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : activeSection === 'shop' ? (
          <View style={styles.productList}>
            {/* Category filter chips */}
            <FlatList
              horizontal
              data={['All', ...SHOP_CATEGORIES]}
              keyExtractor={c => c}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shopFilterBar}
              renderItem={({ item: cat }) => {
                const active = activeShopCat === cat;
                return (
                  <TouchableOpacity
                    onPress={() => setActiveShopCat(cat)}
                    activeOpacity={0.7}
                    style={[
                      styles.shopFilterChip,
                      active
                        ? { backgroundColor: theme.interactive.primary }
                        : { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle },
                    ]}
                  >
                    <Text style={[
                      styles.shopFilterChipLabel,
                      { color: active ? '#fff' : theme.text.secondary },
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Product grid */}
            <View style={styles.shopGrid}>
              {bundleCatalog
                .filter(item => activeShopCat === 'All' || item.category === activeShopCat)
                .map(item => {
                  const qty = cart[item.id] ?? 0;
                  return (
                    <View
                      key={item.id}
                      style={[styles.shopGridItem, { backgroundColor: theme.bg.surface, borderColor: qty > 0 ? theme.interactive.primary : theme.border.subtle }]}
                    >
                      {item.image && (
                        <View>
                          <Image source={{ uri: item.image }} style={styles.shopGridImage} resizeMode="cover" />
                          <TouchableOpacity
                            onPress={() => toggleShopItemWishlist(item)}
                            activeOpacity={0.7}
                            style={[styles.shopGridHeartBtn, { backgroundColor: theme.bg.surface }]}
                          >
                            <Icon name="heart" size={14} color={isWishlisted(item.id) ? Colors.accent.rose.text : theme.text.tertiary} />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View style={styles.shopGridBody}>
                        <Text style={[styles.shopGridName, { color: theme.text.primary }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.shopGridPrice, { color: theme.text.brand }]}>₦{item.price.toLocaleString()}</Text>
                        {qty === 0 ? (
                          <TouchableOpacity
                            onPress={() => addShopItem(item.id)}
                            activeOpacity={0.8}
                            style={[styles.shopGridAddBtn, { backgroundColor: theme.interactive.primary }]}
                          >
                            <Text style={styles.shopGridAddLabel}>Add to cart</Text>
                          </TouchableOpacity>
                        ) : (
                          <InCartPill onPress={() => navigation.navigate('Cart')} />
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        ) : (
          <View style={styles.productList}>
            {/* P2P sub-tab row */}
            <View style={styles.p2pTabRow}>
              <View style={[styles.p2pTabPills, { backgroundColor: theme.bg.subtle }]}>
                {(['browse', 'mine'] as const).map(v => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setP2pView(v)}
                    activeOpacity={0.7}
                    style={[
                      styles.p2pTabPill,
                      p2pView === v && [styles.p2pTabPillActive, { backgroundColor: theme.bg.surface, ...Shadow.sm }],
                    ]}
                  >
                    <Text style={[
                      styles.p2pTabPillLabel,
                      { color: p2pView === v ? theme.text.brand : theme.text.tertiary },
                    ]}>
                      {v === 'browse' ? 'Browse' : `My listings${myListings.length > 0 ? ` (${myListings.length})` : ''}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {p2pView === 'browse' && (
                <TouchableOpacity
                  onPress={() => setListItemVisible(true)}
                  activeOpacity={0.8}
                  style={[styles.listItemBtn, { backgroundColor: theme.interactive.primary }]}
                >
                  <Icon name="add" size={14} color="#fff" />
                  <Text style={styles.listItemBtnLabel}>List item</Text>
                </TouchableOpacity>
              )}
            </View>

            {p2pView === 'browse' ? (
              <>
                <Text style={[styles.p2pNote, { color: theme.text.secondary }]}>
                  Parents listing items they no longer need. Pay only the delivery fee to claim.
                </Text>
                {p2pItems.map((item, i) => (
                  <Card key={item.id} style={styles.productCard} padding="none">
                    <View style={styles.carouselWrap}>
                      <ImageCarousel images={item.images ?? []} height={180} />
                      <View style={[styles.freeBadge, { backgroundColor: theme.accent.sage.bg }]}>
                        <Text style={[styles.freeBadgeText, { color: theme.accent.sage.text }]}>FREE</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleWishlist(item)}
                        activeOpacity={0.7}
                        style={[styles.carouselHeartBtn, { backgroundColor: theme.bg.surface }]}
                      >
                        <Icon name="heart" size={16} color={isWishlisted(item.id) ? Colors.accent.rose.text : theme.text.tertiary} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.p2pCardBody}>
                      <View style={styles.p2pHeader}>
                        <View style={[styles.p2pAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                          <Text style={[styles.p2pAvatarText, { color: HERO_TEXT[i % HERO_TEXT.length] }]}>{item.p2pUser?.[0] ?? 'U'}</Text>
                        </View>
                        <View style={styles.p2pUserInfo}>
                          <Text style={[styles.p2pUser, { color: theme.text.secondary }]}>{item.p2pUser}</Text>
                          <Text style={[styles.p2pLocation, { color: theme.text.tertiary }]}>📍 {item.p2pLocation}</Text>
                        </View>
                      </View>
                      <View style={styles.p2pNameDesc}>
                        <Text style={[styles.cardName, { color: theme.text.primary, fontSize: Typography.size.base }]}>{item.name}</Text>
                        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>{item.description}</Text>
                      </View>
                      <View style={[styles.cardFooter, { borderTopColor: theme.border.subtle }]}>
                        <View>
                          <Text style={[styles.p2pPriceLabel, { color: theme.text.tertiary }]}>Item is free</Text>
                          <Text style={[styles.p2pLogistics, { color: theme.text.secondary }]}>
                            Logistics: <Text style={{ color: theme.text.primary, fontFamily: Typography.fontFamily.bodyBold }}>{item.currency}{(item.logisticsPrice ?? 0).toLocaleString()}</Text>
                          </Text>
                        </View>
                        {cart[item.id] ? (
                          <InCartPill onPress={() => navigation.navigate('Cart')} label="✓ Claimed" />
                        ) : (
                          <Button label="Claim item" onPress={() => addToCart(item)} size="sm" />
                        )}
                      </View>
                    </View>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {myListings.length === 0 ? (
                  <View style={[styles.emptyState, { backgroundColor: theme.bg.subtle }]}>
                    <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>No listings yet</Text>
                    <Text style={[styles.emptyStateBody, { color: theme.text.secondary }]}>
                      Items you list will appear here. Switch to Browse and tap "List item" to get started.
                    </Text>
                  </View>
                ) : (
                  myListings.map(listing => (
                    <View
                      key={listing.id}
                      style={[styles.myListingRow, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
                    >
                      {listing.images.length > 0 && (
                        <Image source={{ uri: listing.images[0] }} style={styles.myListingThumb} resizeMode="cover" />
                      )}
                      <View style={styles.myListingInfo}>
                        <Text style={[styles.myListingName, { color: theme.text.primary }]}>{listing.name}</Text>
                        <Text style={[styles.myListingMeta, { color: theme.text.tertiary }]}>
                          {conditionLabel(listing.condition)} · 📍 {listing.ownerLocation}
                        </Text>
                        <Text style={[styles.myListingMeta, { color: theme.text.tertiary }]}>
                          {listing.images.length} photo{listing.images.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => confirmRemoveListing(listing.id)} activeOpacity={0.7} style={styles.removeBtn}>
                        <Icon name="delete_2" size={16} color={theme.text.tertiary} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
                <TouchableOpacity
                  onPress={() => setListItemVisible(true)}
                  activeOpacity={0.8}
                  style={[styles.listItemBtn, styles.listItemBtnFull, { backgroundColor: theme.interactive.primary }]}
                >
                  <Icon name="add" size={16} color="#fff" />
                  <Text style={[styles.listItemBtnLabel, { fontSize: Typography.size.base }]}>List another item</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <BuildBundleModal
        visible={buildBundleVisible}
        initialSelection={customBundle?.selection ?? {}}
        onClose={() => setBuildBundleVisible(false)}
        onConfirm={(selection, total) => {
          const hasItems = Object.keys(selection).length > 0;
          setCustomBundle(hasItems ? { selection, total } : null);
        }}
      />

      <ListItemModal
        visible={listItemVisible}
        onClose={() => setListItemVisible(false)}
        onSubmit={addListing}
      />

      {cartCount > 0 && (
        <View style={[styles.cartBar, { backgroundColor: theme.interactive.primary, ...Shadow.md }]}>
          <View style={styles.cartBarLeft}>
            <Icon name="shopping_cart_1" size={18} color="#fff" />
            <Text style={styles.cartBarCount}>{cartCount} item{cartCount !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity onPress={handleCheckout} activeOpacity={0.85} style={styles.cartBarBtn}>
            <Text style={styles.cartBarTotal}>{cartCurrency}{cartTotal.toLocaleString()}</Text>
            <Text style={styles.cartBarCheckout}>Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[12],
    gap: Spacing[5],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  backLabel: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.size.sm,
  },
  header: { gap: Spacing[1] },
  title: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size['2xl'],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  segmentActive: { borderRadius: Radius.full },
  segmentLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  productList: { gap: Spacing[4] },
  productCard: { overflow: 'hidden', padding: 0 },

  // ── Carousel ────────────────────────────────────────────────────────────────
  carouselWrap: { position: 'relative' },
  carouselDots: {
    position: 'absolute',
    bottom: Spacing[2],
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  carouselDotActive: {
    width: 16,
    backgroundColor: '#fff',
  },
  carouselHeartBtn: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bundle card ─────────────────────────────────────────────────────────────
  cardBody: {
    padding: Spacing[5],
    gap: Spacing[3],
  },
  bundleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  bundleTagText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  cardName: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
    lineHeight: Typography.size.lg * 1.3,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  itemList: { gap: Spacing[1] },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  itemDot: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.sm * 1.6,
  },
  itemText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    flex: 1,
  },
  readMoreBtn: { alignSelf: 'flex-start' },
  readMoreLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[2],
    borderTopWidth: 1,
  },
  price: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  customBundleMeta: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },

  // ── P2P card ────────────────────────────────────────────────────────────────
  p2pTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  p2pTabPills: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    gap: 2,
    flex: 1,
  },
  p2pTabPill: {
    flex: 1,
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  p2pTabPillActive: { borderRadius: Radius.full },
  p2pTabPillLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  emptyState: {
    borderRadius: Radius.xl,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[2],
  },
  emptyStateTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
  },
  emptyStateBody: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    textAlign: 'center',
  },
  listItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  listItemBtnLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  listItemBtnFull: {
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
  },
  myListingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  myListingThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
  },
  myListingInfo: { flex: 1, gap: 2 },
  myListingName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  myListingMeta: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.5,
  },
  removeBtn: { padding: Spacing[1] },
  p2pNote: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
  },
  p2pCardBody: {
    padding: Spacing[5],
    gap: Spacing[3],
  },
  p2pHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  p2pAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  p2pAvatarText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
  },
  p2pUserInfo: { flex: 1 },
  p2pUser: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  p2pLocation: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  p2pNameDesc: { gap: Spacing[1] },
  freeBadge: {
    position: 'absolute',
    top: Spacing[3],
    left: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  freeBadgeText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.xs,
    letterSpacing: 0.5,
  },
  p2pPriceLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  p2pLogistics: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },

  // ── Wishlist & cart ──────────────────────────────────────────────────────────
  wishlistIconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  wishlistBadgeText: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 9,
    color: '#fff',
  },
  // ── Shop section ────────────────────────────────────────────────────────────
  shopFilterBar: {
    gap: Spacing[2],
    paddingVertical: Spacing[1],
  },
  shopFilterChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  shopFilterChipLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  shopGridItem: {
    width: '48%',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  shopGridImage: {
    width: '100%',
    height: 110,
  },
  shopGridBody: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  shopGridName: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.4,
  },
  shopGridPrice: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.sm,
  },
  shopGridHeartBtn: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopGridAddBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: Radius.full,
  },
  shopGridAddLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    includeFontPadding: false,
    color: '#fff',
  },
  inCartPill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCartPillText: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
  },
  cartBar: {
    position: 'absolute',
    bottom: Spacing[5],
    left: Spacing[5],
    right: Spacing[5],
    borderRadius: Radius['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  cartBarCount: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
    color: '#fff',
  },
  cartBarBtn: { alignItems: 'flex-end' },
  cartBarTotal: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
  cartBarCheckout: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.75)',
  },
});
