import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDraggableDrawer } from "@/src/hooks/useDraggableDrawer";
import { useRealtimeQuotes } from "@/src/hooks/useRealtimeQuotes";
import type { SymbolDisplayData } from "@/src/hooks/useSymbolDisplayData";
import { formatPrice, formatSigned } from "@/src/utils";
import { getStockChangeInfo } from "@/src/utils/stockUtils";
import { Sparkline } from "../ui/Sparkline";
import { useTheme } from "@/src/theme";

export interface StockDetailItem {
  symbol: string;
  name: string | null;
  price: number;
  change: number;
  historyValues?: number[];
}

export interface WatchlistMembership {
  watchlistItemId: string;
  watchlistName: string;
}

export interface WatchlistContext {
  memberships: WatchlistMembership[];
  watchlistOptions: { watchlist_id: string; name: string }[];
  onAdd: (watchlistId: string) => void;
  onRemove: (watchlistItemId: string) => void;
}

interface StockDetailDrawerProps {
  visible: boolean;
  item: StockDetailItem | null;
  onClose: () => void;
  displayData?: SymbolDisplayData | null;
  watchlistContext?: WatchlistContext | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_HEIGHT = Math.min(Dimensions.get("window").height * 0.88, 680);
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;

const PERIODS = ["1D", "1W", "1M", "3M", "1Y"] as const;

export function StockDetailDrawer({
  visible,
  item,
  onClose,
  displayData,
  watchlistContext,
}: StockDetailDrawerProps) {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PERIODS[number]>("1D");
  const [showAddToWatchlist, setShowAddToWatchlist] = useState(false);

  const drawerSymbols = useMemo(
    () => (item && !displayData ? [item.symbol] : []),
    [item?.symbol, displayData]
  );
  const { quotes } = useRealtimeQuotes(drawerSymbols);

  const fallbackQuote = item ? quotes[item.symbol.toUpperCase()] : undefined;
  const price = displayData?.price ?? fallbackQuote?.price ?? item?.price ?? 0;
  const change = displayData?.change ?? fallbackQuote?.change ?? item?.change ?? 0;

  const chartValues = useMemo(() => {
    if (displayData?.history?.length) return displayData.history;
    const history = item?.historyValues ?? [];
    if (price > 0) return [...history, price];
    return history.length > 0 ? history : [];
  }, [displayData?.history, item?.historyValues, price]);

  const stats = useMemo(() => {
    if (!item) return null;
    const open = price - change;
    const allPrices = chartValues.length > 0 ? chartValues : [price];
    const high = Math.max(...allPrices);
    const low = Math.min(...allPrices);
    return { open, high, low };
  }, [item, price, change, chartValues]);

  const { slideAnim, dragOffset, panHandlers, backdropOpacity, closeWithAnimation } =
    useDraggableDrawer({ visible, drawerHeight: DRAWER_HEIGHT, onClose });

  if (!item) return null;

  const { isUp, trend, changeColor, changePercent } = getStockChangeInfo(
    change,
    price
  );

  const handleShare = async () => {
    try {
      const shareText = `${item.symbol} - ${formatPrice(price)} (${isUp ? "+" : ""}${changePercent}%)`;
      await Share.share({
        message: shareText,
        title: item.symbol,
      });
    } catch {
      // Share cancelled or failed
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.modalRoot}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: colors.backdrop }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            {
              height: DRAWER_HEIGHT,
              backgroundColor: colors.cardSolid,
              transform: [
                {
                  translateY: Animated.add(slideAnim, dragOffset),
                },
              ],
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.dragArea} {...panHandlers}>
              <View style={[styles.dragHandle, { backgroundColor: colors.textTertiary }]} />
            </View>
            <View style={styles.headerBar}>
              <View style={styles.headerRow}>
                <Text style={[styles.symbolTitle, { color: colors.text }]}>{item.symbol}</Text>
                <View style={styles.headerActions}>
                  <Pressable onPress={handleShare} hitSlop={12} style={styles.actionBtn}>
                    <MaterialIcons name="share" size={20} color={colors.text} />
                  </Pressable>
                  <Pressable onPress={closeWithAnimation} hitSlop={12} style={styles.closeBtn}>
                    <MaterialIcons name="close" size={22} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            </View>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
            >
              {item.name ? (
                <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.name}
                </Text>
              ) : null}
              <Text style={[styles.price, { color: colors.text }]}>{formatPrice(price)}</Text>
              <View style={styles.changeRow}>
                <Text style={[styles.changeText, { color: changeColor }]}>
                  {isUp ? "+" : ""}{formatSigned(change)} ({isUp ? "+" : ""}
                  {changePercent}%)
                </Text>
                <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Today</Text>
              </View>
              <View style={styles.periodRow}>
                {PERIODS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setSelectedPeriod(p)}
                    style={[
                      styles.periodPill,
                      {
                        backgroundColor: selectedPeriod === p ? colors.primaryLight : colors.surface,
                        borderColor: selectedPeriod === p ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        {
                          color: selectedPeriod === p ? colors.primary : colors.textSecondary,
                          fontWeight: selectedPeriod === p ? "600" : "400",
                        },
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.chartContainer}>
                <Sparkline
                  data={chartValues}
                  trend={trend}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                />
              </View>
              <View style={styles.statsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Statistics</Text>
                <View style={styles.statsTable}>
                  <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Open</Text>
                    <Text style={[styles.statsValue, { color: colors.text }]}>
                      {stats ? formatPrice(stats.open) : "—"}
                    </Text>
                  </View>
                  <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>High</Text>
                    <Text style={[styles.statsValue, { color: colors.text }]}>
                      {stats ? formatPrice(stats.high) : "—"}
                    </Text>
                  </View>
                  <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Low</Text>
                    <Text style={[styles.statsValue, { color: colors.text }]}>
                      {stats ? formatPrice(stats.low) : "—"}
                    </Text>
                  </View>
                  <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Volume</Text>
                    <Text style={[styles.statsValue, { color: colors.text }]}>—</Text>
                  </View>
                </View>
              </View>
              {watchlistContext ? (
                <View style={[styles.watchlistSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Watchlist</Text>
                  {watchlistContext.memberships.map((m) => (
                    <Pressable
                      key={m.watchlistItemId}
                      style={[styles.watchlistRow, { borderBottomColor: colors.border }]}
                      onPress={() => watchlistContext.onRemove(m.watchlistItemId)}
                    >
                      <MaterialIcons
                        name="star"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.watchlistRowLabel, { color: colors.text }]}>
                        Remove from {m.watchlistName}
                      </Text>
                    </Pressable>
                  ))}
                  {watchlistContext.watchlistOptions.length > 0 ? (
                    <Pressable
                      style={[styles.watchlistRow, { borderBottomColor: colors.border }]}
                      onPress={() => setShowAddToWatchlist(true)}
                    >
                      <MaterialIcons
                        name="add-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[styles.watchlistRowLabel, styles.addToWatchlistText, { color: colors.primary }]}>
                        Add to Watchlist
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </ScrollView>
            <Modal
              visible={showAddToWatchlist && !!watchlistContext}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAddToWatchlist(false)}
            >
              <Pressable
                style={[styles.addModalOverlay, { backgroundColor: colors.backdrop }]}
                onPress={() => setShowAddToWatchlist(false)}
              >
                <View style={[styles.addModalSheet, { backgroundColor: colors.cardSolid }]}>
                  <Text style={[styles.addModalTitle, { color: colors.textTertiary }]}>Add to Watchlist</Text>
                  {watchlistContext?.watchlistOptions.map((w) => (
                    <Pressable
                      key={w.watchlist_id}
                      style={styles.addModalRow}
                      onPress={() => {
                        watchlistContext.onAdd(w.watchlist_id);
                        setShowAddToWatchlist(false);
                      }}
                    >
                      <Text style={[styles.addModalRowText, { color: colors.primary }]}>{w.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.addModalCancel}
                    onPress={() => setShowAddToWatchlist(false)}
                  >
                    <Text style={[styles.addModalCancelText, { color: colors.primary }]}>Cancel</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  dragArea: {
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: "center",
    minHeight: 40,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  symbolTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  companyName: {
    fontSize: 15,
    marginBottom: 4,
  },
  price: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  changeText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  todayLabel: {
    fontSize: 15,
    fontWeight: "400",
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  periodText: {
    fontSize: 15,
    fontWeight: "500",
  },
  chartContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    alignSelf: "center",
    marginBottom: 28,
  },
  statsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsTable: {
    gap: 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsLabel: {
    fontSize: 17,
    fontWeight: "400",
  },
  statsValue: {
    fontSize: 17,
    fontWeight: "600",
  },
  watchlistSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
    marginTop: 8,
  },
  watchlistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  watchlistRowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "400",
  },
  addToWatchlistText: {},
  addModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  addModalSheet: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  addModalTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  addModalRow: {
    paddingVertical: 14,
  },
  addModalRowText: {
    fontSize: 17,
    fontWeight: "400",
  },
  addModalCancel: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  addModalCancelText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
