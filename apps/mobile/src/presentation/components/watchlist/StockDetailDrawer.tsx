import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useDraggableDrawer, type SymbolDisplayData } from "@/src/presentation/hooks";
import { formatPrice, formatSigned } from "@/src/presentation/utils";
import { getStockChangeInfo, PeriodDataProcessor } from "@/src/presentation/utils";
import { InteractiveStockChart } from "./InteractiveStockChart";
import { useTheme } from "@/src/presentation/theme";
import { useAppDispatch, useAppSelector } from "@/src/presentation/store";
import { selectQuotesForSymbols } from "@/src/presentation/store/quotesSelectors";
import { setExtraSubscribedSymbols } from "@/src/presentation/store/quotesSlice";
import {
  AbsoluteFill,
  DrawerModalRoot,
  DrawerBackdrop,
  DrawerSheet,
  DrawerSafe,
  DrawerDragArea,
  DrawerHandle,
} from "@/src/presentation/theme/primitives";

export interface StockDetailItem {
  symbol: string;
  name: string | null;
  price: number;
  change: number;
  volume?: number;
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
const CHART_WIDTH = SCREEN_WIDTH - 32 - 90;
const CHART_HEIGHT = 280;
const VOLUME_HEIGHT = 60;

const PERIODS = ["1D", "1W", "1M", "3M", "1Y"] as const;

export function StockDetailDrawer({
  visible,
  item,
  onClose,
  displayData,
  watchlistContext,
}: StockDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const { isDark, colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PERIODS[number]>("1D");
  const [showAddToWatchlist, setShowAddToWatchlist] = useState(false);

  const drawerSymbols = useMemo(() => (item ? [item.symbol] : []), [item?.symbol]);
  const quotes = useAppSelector((s) => selectQuotesForSymbols(s, drawerSymbols));

  useEffect(() => {
    dispatch(setExtraSubscribedSymbols(visible && item ? [item.symbol] : []));
    return () => {
      dispatch(setExtraSubscribedSymbols([]));
    };
  }, [visible, item?.symbol, dispatch]);

  const quote = item ? quotes[item.symbol.toUpperCase()] : undefined;
  const price = quote?.price ?? item?.price ?? 0;
  const change = quote?.change ?? item?.change ?? 0;
  const realtimeVolume = quote?.volume;

  const allChartValues = useMemo(() => {
    if (displayData?.history?.length) return displayData.history;
    const history = item?.historyValues ?? [];
    return price > 0 ? [...history, price] : history;
  }, [displayData?.history, item?.historyValues, price]);
  
  const volumeHistoryRef = useRef<Array<{ price: number; volume: number; timestamp: number }>>([]);
  
  useEffect(() => {
    if (realtimeVolume !== undefined && realtimeVolume > 0 && price > 0) {
      const current = volumeHistoryRef.current;
      const lastEntry = current[current.length - 1];
      if (!lastEntry || lastEntry.price !== price || lastEntry.volume !== realtimeVolume) {
        volumeHistoryRef.current = [...current, { price, volume: realtimeVolume, timestamp: Date.now() }].slice(-100);
      }
    }
  }, [realtimeVolume, price]);

  const { data: chartValues, timestamps: chartTimestamps, volume: volumeData } = useMemo(() => {
    const result = PeriodDataProcessor.process(selectedPeriod, allChartValues, volumeHistoryRef.current);
    return {
      data: result.data,
      timestamps: result.timestamps,
      volume: result.volume.length === result.data.length ? result.volume : result.data.map(() => 750000),
    };
  }, [selectedPeriod, allChartValues]);

  const baselineValue = useMemo(() => {
    if (!item) return undefined;
    if (chartValues.length === 0) return undefined;
    const sorted = [...chartValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }, [item, chartValues]);

  const stats = useMemo(() => {
    if (!item) return null;
    const open = baselineValue ?? price - change;
    const allPrices = chartValues.length > 0 ? chartValues : [price];
    return { open, high: Math.max(...allPrices), low: Math.min(...allPrices) };
  }, [item, price, change, chartValues, baselineValue]);

  const chartTrend = useMemo(() => {
    if (chartValues.length === 0 || baselineValue === undefined) return "flat";
    const latestValue = chartValues[chartValues.length - 1];
    if (latestValue > baselineValue) return "up";
    if (latestValue < baselineValue) return "down";
    return "flat";
  }, [chartValues, baselineValue]);

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

  const translateY = Animated.add(slideAnim, dragOffset);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeWithAnimation}
    >
      <DrawerModalRoot>
        <DrawerBackdrop style={{ opacity: backdropOpacity }} pointerEvents="box-none">
          <AbsoluteFill onPress={closeWithAnimation} />
        </DrawerBackdrop>
        <DrawerSheet
          style={{
            height: DRAWER_HEIGHT,
            transform: [{ translateY }],
          }}
        >
          <DrawerSafe edges={["top"]}>
            <DrawerDragArea {...panHandlers}>
              <DrawerHandle />
            </DrawerDragArea>
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 22, fontWeight: "700", letterSpacing: -0.4, color: colors.text }}>{item.symbol}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Pressable onPress={handleShare} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="share" size={20} color={colors.text} />
                  </Pressable>
                  <Pressable onPress={closeWithAnimation} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcons name="close" size={22} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
            >
              {item.name ? (
                <Text style={{ fontSize: 15, marginBottom: 6, fontWeight: "400", color: colors.textSecondary }} numberOfLines={1}>
                  {item.name}
                </Text>
              ) : null}
              <Text style={{ fontSize: 36, fontWeight: "700", letterSpacing: -0.5, marginBottom: 6, color: colors.text }}>{formatPrice(price)}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", letterSpacing: -0.3, color: changeColor }}>
                  {formatSigned(change)} ({isUp ? "+" : ""}{changePercent}%)
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "400", color: colors.textSecondary }}>
                  {selectedPeriod === "1D" ? "Today" : selectedPeriod}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 20 }}>
                {PERIODS.map((p) => {
                  const isSelected = selectedPeriod === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setSelectedPeriod(p)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        borderWidth: 1,
                        minHeight: 32,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: isSelected ? colors.primaryLight : (isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"),
                        borderColor: isSelected ? colors.accent : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? "600" : "500",
                          color: isSelected ? colors.accent : colors.textSecondary,
                        }}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ width: CHART_WIDTH + 90, height: CHART_HEIGHT, alignSelf: "center", marginBottom: 8, marginTop: 4, overflow: "visible", paddingBottom: 30 }}>
                <InteractiveStockChart
                  data={chartValues}
                  timestamps={chartTimestamps}
                  baselineValue={baselineValue}
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                />
              </View>
              <View style={{ borderTopWidth: 1, paddingTop: 20, marginTop: 4, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 13, fontWeight: "600", letterSpacing: 0.02, marginBottom: 16, color: colors.textSecondary }}>Key Statistics</Text>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 16, fontWeight: "400", color: colors.textSecondary }}>Open</Text>
                    <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>
                      {stats ? formatPrice(stats.open) : "—"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 16, fontWeight: "400", color: colors.textSecondary }}>High</Text>
                    <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>
                      {stats ? formatPrice(stats.high) : "—"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 16, fontWeight: "400", color: colors.textSecondary }}>Low</Text>
                    <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>
                      {stats ? formatPrice(stats.low) : "—"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 16, fontWeight: "400", color: colors.textSecondary }}>Volume</Text>
                    <Text style={{ fontSize: 16, fontWeight: "500", color: colors.text }}>—</Text>
                  </View>
                </View>
              </View>
              {watchlistContext ? (
                <View style={{ borderTopWidth: 1, paddingTop: 20, marginTop: 8, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", letterSpacing: 0.02, marginBottom: 16, color: colors.textSecondary }}>Watchlist</Text>
                  {watchlistContext.memberships.map((m) => (
                    <Pressable
                      key={m.watchlistItemId}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => watchlistContext.onRemove(m.watchlistItemId)}
                    >
                      <MaterialIcons
                        name="star"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={{ flex: 1, fontSize: 17, fontWeight: "400", color: colors.text }}>
                        Remove from {m.watchlistName}
                      </Text>
                    </Pressable>
                  ))}
                  {watchlistContext.watchlistOptions.length > 0 ? (
                    <Pressable
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => setShowAddToWatchlist(true)}
                    >
                      <MaterialIcons
                        name="add-circle-outline"
                        size={20}
                        color={colors.accent}
                      />
                      <Text style={{ flex: 1, fontSize: 17, fontWeight: "400", color: colors.accent }}>
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
                style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.backdrop }}
                onPress={() => setShowAddToWatchlist(false)}
              >
                <View style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, backgroundColor: colors.cardSolid }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", letterSpacing: 0.02, marginBottom: 12, color: colors.textSecondary }}>Add to Watchlist</Text>
                  {watchlistContext?.watchlistOptions.map((w) => (
                    <Pressable
                      key={w.watchlist_id}
                      style={{ paddingVertical: 14 }}
                      onPress={() => {
                        watchlistContext.onAdd(w.watchlist_id);
                        setShowAddToWatchlist(false);
                      }}
                      >
                      <Text style={{ fontSize: 17, fontWeight: "400", color: colors.accent }}>{w.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={{ marginTop: 16, paddingVertical: 14, alignItems: "center" }}
                    onPress={() => setShowAddToWatchlist(false)}
                  >
                    <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textSecondary }}>Cancel</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </DrawerSafe>
        </DrawerSheet>
      </DrawerModalRoot>
    </Modal>
  );
}
