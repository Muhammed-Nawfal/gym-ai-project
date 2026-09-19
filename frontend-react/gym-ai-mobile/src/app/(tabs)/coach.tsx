import { Bot, Menu, MessageSquarePlus, Send, Sparkles, Trash2, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { ChatMessageDto, ChatSummaryDto, ProposedWorkoutPlan } from "../../api/types";
import { appColors, dangerAlpha, goldAlpha, whiteAlpha } from "../../constants/appColors";
import { useLocalSearchParams, useRouter } from "expo-router";

const markdownStyles = {
  body: { color: appColors.ink, fontSize: 14.5, lineHeight: 20 },
  strong: { color: appColors.white, fontWeight: "700" as const },
  heading1: { color: appColors.gold, fontSize: 16, fontWeight: "700" as const, marginTop: 4, marginBottom: 4 },
  heading2: { color: appColors.gold, fontSize: 15.5, fontWeight: "700" as const, marginTop: 4, marginBottom: 4 },
  heading3: { color: appColors.gold, fontSize: 15, fontWeight: "700" as const, marginTop: 4, marginBottom: 4 },
  heading4: { color: appColors.gold, fontSize: 14.5, fontWeight: "700" as const, marginTop: 4, marginBottom: 4 },
  bullet_list: { marginVertical: 2 },
  ordered_list: { marginVertical: 2 },
  list_item: { marginBottom: 2 },
  hr: { backgroundColor: whiteAlpha(0.1), height: 1, marginVertical: 8 },
  code_inline: {
    backgroundColor: whiteAlpha(0.08),
    color: appColors.ink,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
};

let nextLocalId = -1;
const makeLocalId = () => nextLocalId--;

const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function CoachScreen() {
    const { token } = useAuth();

    const [chatId, setChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [planStatusById, setPlanStatusById] = useState<Record<string, "applying" | "failed">>({});
    const [appliedWorkoutKeys, setAppliedWorkoutKeys] = useState<Record<string, true>>({});

    const [historyVisible, setHistoryVisible] = useState(false);
    const [chatList, setChatList] = useState<ChatSummaryDto[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const listRef = useRef<FlatList<ChatMessageDto>>(null);
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const params = useLocalSearchParams<{
        insightId?: string;
        insightExerciseName?: string;
        insightMessage?: string;
        insightNonce?: string;
    }>();
    const handledInsightKeyRef = useRef<string | null>(null);
    const [insightStatusById, setInsightStatusById] = useState<Record<number, "resolving" | "failed">>({});
    const [insightLinkedChat, setInsightLinkedChat] = useState(false);

    const scrollToEnd = () => {
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    const openHistory = async () => {
        setHistoryVisible(true);
        setLoadingHistory(true);
        try {
            const res = await client.get<ChatSummaryDto[]>("/api/chats", authHeaders);
            setChatList(res.data);
        } finally {
            setLoadingHistory(false);
        }
    };

    const startNewChat = () => {
        setChatId(null);
        setMessages([]);
        setHistoryVisible(false);
        setInsightLinkedChat(false);
    };

    const openChat = async (id: number) => {
        const res = await client.get<ChatMessageDto[]>(`/api/chats/${id}/messages`, authHeaders);
        setChatId(id);
        setMessages(res.data);
        setHistoryVisible(false);
        setInsightLinkedChat(res.data.some((m) => m.resolvableInsight != null));
        scrollToEnd();
    };

    const confirmDeleteChat = (chat: ChatSummaryDto) => {
        Alert.alert("Delete chat?", "This can't be undone.", [
        { text: "Cancel", style: "cancel" },
        {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
                await client.delete(`/api/chats/${chat.id}`, authHeaders);
                setChatList((prev) => prev.filter((c) => c.id !== chat.id));
                if (chat.id === chatId) startNewChat();
            },
        },
        ]);
    };

    const sendMessage = async (overrideText?: string, opts?: { insightId?: number; forceNewChat?: boolean }) => {
        const text = (overrideText ?? input ).trim();
        if (!text || sending) return;

        const optimisticUserMessage: ChatMessageDto = {
            id: makeLocalId(),
            role: "USER",
            content: text,
            proposedWorkoutPlan: null,
            planApplied: false,
            resolvableInsight: null,
            insightResolved: false,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticUserMessage]);
        setInput("");
        setSending(true);
        scrollToEnd();

        try {
            let activeChatId = opts?.forceNewChat ? null : chatId;
            if (activeChatId === null) {
                const created = await client.post<ChatSummaryDto>("/api/chats", {}, authHeaders);
                activeChatId = created.data.id;
                setChatId(activeChatId);
            }

            const res = await client.post<ChatMessageDto>(
                `/api/chats/${activeChatId}/messages`,
                { message: text, insightId: opts?.insightId },
                authHeaders
            );
            setMessages((prev) => [...prev, res.data]);
        } 
        catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: makeLocalId(),
                    role: "ASSISTANT",
                    content: "Something went wrong. Please try again.",
                    proposedWorkoutPlan: null,
                    planApplied: false,
                    resolvableInsight: null,
                    insightResolved: false,
                    createdAt: new Date().toISOString(),
                },
            ]);
        } 
        finally {
            setSending(false);
            scrollToEnd();
        }
    };

    useEffect(() => {
        if(!params.insightId) return;
        const key = `${params.insightId}-${params.insightNonce ?? ""}`;

        if(handledInsightKeyRef.current == key) return;
        handledInsightKeyRef.current = key;

        setMessages([]);
        setInsightLinkedChat(true);
        const exerciseLabel = params.insightExerciseName ? `on ${params.insightExerciseName}` : "";
        const text = `I got this insight ${exerciseLabel} : "${params.insightMessage}". Can you help me understand what's going on and what I should do about it?`;

        sendMessage(text, { insightId: Number(params.insightId), forceNewChat: true});
    }, [params.insightId, params.insightNonce]);

    const applyWorkout = async (message: ChatMessageDto, workoutIndex: number) => {
        if (!chatId || !message.proposedWorkoutPlan) return;
        const workout = message.proposedWorkoutPlan.workouts[workoutIndex];
        const statusKey = `${message.id}-${workoutIndex}`;

        setPlanStatusById((prev) => ({ ...prev, [statusKey]: "applying" }));

        try {
            const applyRes = await client.post<{ skippedExercises: string[] }>(
                "/api/workout/apply-plan",
                { workoutId: workout.workoutId, workoutName: workout.workoutName, exercises: workout.exercises },
                authHeaders
            );

            setAppliedWorkoutKeys((prev) => {
                const next = { ...prev, [statusKey]: true as const };
                const allApplied = message.proposedWorkoutPlan!.workouts.every(
                    (_, idx) => next[`${message.id}-${idx}`]
                );
                if (allApplied) {
                    client.patch(`/api/chats/${chatId}/messages/${message.id}/plan-applied`, {}, authHeaders).catch(() => {});
                    setMessages((prevMsgs) => prevMsgs.map((m) => (m.id === message.id ? { ...m, planApplied: true } : m)));
                }
                return next;
            });

            setPlanStatusById((prev) => {
                const next = { ...prev };
                delete next[statusKey];
                return next;
            });

            const skipped = applyRes.data.skippedExercises;
            if (skipped && skipped.length > 0) {
                Alert.alert(
                    "Some exercises weren't saved",
                    `These aren't in the exercise library yet, so they were left out:\n\n${skipped.join(", ")}`
                );
            }
        } catch {
            setPlanStatusById((prev) => ({ ...prev, [statusKey]: "failed" }));
        }
    };

    const resolveInsight = async (message: ChatMessageDto) => {
        if (!chatId || !message.resolvableInsight) return;
        const insightId = message.resolvableInsight.insightId;

        setInsightStatusById((prev) => ({ ...prev, [message.id]: "resolving" }));

        try {
            await client.patch(`/api/insights/${insightId}/resolve`, {}, authHeaders);
            await client.patch(`/api/chats/${chatId}/messages/${message.id}/insight-resolved`, {}, authHeaders);

            setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, insightResolved: true } : m)));
            setInsightStatusById((prev) => {
                const next = { ...prev };
                delete next[message.id];
                return next;
            });
        } catch {
            setInsightStatusById((prev) => ({ ...prev, [message.id]: "failed" }));
        }
    };

    const renderItem = ({ item }: { item: ChatMessageDto }) => {
        if (item.role === "USER") {
        return (
            <View style={[styles.bubbleRow, styles.bubbleRowRight]}>
            <View style={[styles.bubble, styles.userBubble]}>
                <Text style={styles.userText}>{item.content}</Text>
            </View>
            </View>
        );
        }

        return (
        <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
            <View style={styles.avatar}>
            <Sparkles color={appColors.gold} size={14} />
            </View>

            <View style={styles.assistantColumn}>
            <View style={[styles.bubble, styles.assistantBubble]}>
                <Markdown style={markdownStyles}>{item.content}</Markdown>
            </View>

            {item.proposedWorkoutPlan?.workouts.map((workout, workoutIndex) => {
                const statusKey = `${item.id}-${workoutIndex}`;
                const planStatus = planStatusById[statusKey];
                const applied = item.planApplied || !!appliedWorkoutKeys[statusKey];

                return (
                <View key={workoutIndex} style={styles.planCard}>
                    <Text style={styles.planTitle}>{workout.workoutName}</Text>
                    {workout.exercises.map((ex, idx) => (
                        <View key={idx} style={styles.planRow}>
                        <Text style={styles.planExerciseName}>{ex.exerciseName}</Text>
                        <Text style={styles.planExerciseDetail}>
                            {ex.sets ?? "?"} x {ex.targetReps ?? "?"}
                            {ex.restSeconds ? `  \u00b7  ${ex.restSeconds}s rest` : ""}
                        </Text>
                        </View>
                    ))}

                    {applied ? (
                        <Text style={styles.planApplied}>Applied to your workouts</Text>
                    ) : (
                        <TouchableOpacity
                        style={[styles.applyButton, planStatus === "applying" && styles.applyButtonDisabled]}
                        disabled={planStatus === "applying"}
                        onPress={() => applyWorkout(item, workoutIndex)}
                        >
                        {planStatus === "applying" ? (
                            <ActivityIndicator color={appColors.black} size="small" />
                        ) : (
                            <Text style={styles.applyButtonText}>
                            {planStatus === "failed" ? "Retry apply" : "Apply to my workouts"}
                            </Text>
                        )}
                        </TouchableOpacity>
                    )}
                </View>
                );
            })}

            {item.resolvableInsight && (
                <View style={styles.planCard}>
                <Text style={styles.planTitle}>Stagnation Insight</Text>
                {item.insightResolved ? (
                    <Text style={styles.planApplied}>Marked as resolved</Text>
                ) : (
                    <TouchableOpacity
                    style={[styles.applyButton, insightStatusById[item.id] === "resolving" && styles.applyButtonDisabled]}
                    disabled={insightStatusById[item.id] === "resolving"}
                    onPress={() => resolveInsight(item)}
                    >
                    {insightStatusById[item.id] === "resolving" ? (
                        <ActivityIndicator color={appColors.black} size="small" />
                    ) : (
                        <Text style={styles.applyButtonText}>
                        {insightStatusById[item.id] === "failed" ? "Retry" : "Mark as resolved"}
                        </Text>
                    )}
                    </TouchableOpacity>
                )}
                </View>
            )}
            </View>
        </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Bot color={appColors.gold} size={30} />
            <Text style={styles.headerTitle}>AI Coach</Text>
            <TouchableOpacity style={styles.historyButton} onPress={openHistory}>
            <Menu color={appColors.muted} size={22} />
            </TouchableOpacity>
        </View>

        {insightLinkedChat && (
            <View style={styles.insightHintBar}>
            <Text style={styles.insightHintText}>
                This chat is about a coach insight — let your coach know when you're ready to mark it resolved.
            </Text>
            </View>
        )}

        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            {messages.length === 0 ? (
            <View style={styles.emptyState}>
                <Sparkles color={appColors.gold} size={22} />
                <Text style={styles.emptyStateText}>
                Hey, I'm your AI coach. Ask me about your training, progress, or injuries - or tell
                me to build you a new workout plan.
                </Text>
            </View>
            ) : (
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={scrollToEnd}
                keyboardShouldPersistTaps="handled"
            />
            )}

            {sending && (
            <View style={styles.typingRow}>
                <ActivityIndicator color={appColors.mutedDark} size="small" />
                <Text style={styles.typingText}>Coach is thinking...</Text>
            </View>
            )}

            <View style={styles.inputRow}>
            <TextInput
                style={styles.input}
                placeholder="Ask your coach anything..."
                placeholderTextColor={appColors.mutedDark}
                value={input}
                onChangeText={setInput}
                multiline
                editable={!sending}
            />
            <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || sending}
            >
                <Send color={appColors.black} size={18} />
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

        <Modal visible={historyVisible} animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
            <SafeAreaView style={styles.historyContainer}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyHeaderTitle}>Chats</Text>
                <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <X color={appColors.muted} size={22} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.newChatRow} onPress={startNewChat}>
                <MessageSquarePlus color={appColors.gold} size={18} />
                <Text style={styles.newChatText}>New chat</Text>
            </TouchableOpacity>

            {loadingHistory ? (
                <ActivityIndicator color={appColors.gold} style={{ marginTop: 24 }} />
            ) : (
                <FlatList
                data={chatList}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                    style={[styles.chatRow, item.id === chatId && styles.chatRowActive]}
                    onPress={() => openChat(item.id)}
                    >
                    <View style={styles.chatRowText}>
                        <Text style={styles.chatRowTitle} numberOfLines={1}>
                        {item.title ?? "New chat"}
                        </Text>
                        <Text style={styles.chatRowTime}>{formatRelativeTime(item.updatedAt)}</Text>
                    </View>
                    <TouchableOpacity hitSlop={10} onPress={() => confirmDeleteChat(item)}>
                        <Trash2 color={appColors.mutedDark} size={18} />
                    </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyHistoryText}>No chats yet.</Text>}
                />
            )}
            </SafeAreaView>
        </Modal>
        </SafeAreaView>
    );
    }

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appColors.black },
    flex: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: whiteAlpha(0.08),
    },
    headerTitle: { color: appColors.white, fontSize: 20, fontWeight: "600", flex: 1 },
    historyButton: { padding: 4 },

    insightHintBar: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: goldAlpha(0.06),
        borderBottomWidth: 1,
        borderBottomColor: goldAlpha(0.1),
    },
    insightHintText: {
        color: appColors.gold,
        fontSize: 12,
        textAlign: "center",
    },

    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    emptyStateText: { color: appColors.muted, fontSize: 14, textAlign: "center", lineHeight: 20 },

    listContent: { padding: 16 },

    bubbleRow: { flexDirection: "row", marginBottom: 12 },
    bubbleRowRight: { justifyContent: "flex-end" },
    bubbleRowLeft: { justifyContent: "flex-start", alignItems: "flex-start", gap: 8 },

    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: goldAlpha(0.1),
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    assistantColumn: { flex: 1, maxWidth: "85%" },

    bubble: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
    userBubble: { backgroundColor: appColors.gold, maxWidth: "80%", borderBottomRightRadius: 4 },
    userText: { color: appColors.black, fontSize: 14.5, lineHeight: 20 },

    assistantBubble: {
        backgroundColor: appColors.cardBg,
        borderWidth: 1,
        borderColor: goldAlpha(0.1),
        borderBottomLeftRadius: 4,
    },

    planCard: {
        marginTop: 8,
        backgroundColor: appColors.cardBg,
        borderWidth: 1,
        borderColor: goldAlpha(0.15),
        borderRadius: 12,
        padding: 12,
    },
    planTitle: { color: appColors.gold, fontSize: 14.5, fontWeight: "600", marginBottom: 8 },
    planRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: whiteAlpha(0.06),
    },
    planExerciseName: { color: appColors.ink, fontSize: 13, flex: 1 },
    planExerciseDetail: { color: appColors.mutedDark, fontSize: 12 },

    applyButton: {
        marginTop: 10,
        backgroundColor: appColors.gold,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    applyButtonDisabled: { opacity: 0.6 },
    applyButtonText: { color: appColors.black, fontWeight: "600", fontSize: 13.5 },
    planApplied: { color: appColors.gold, fontSize: 13, fontWeight: "600", marginTop: 10 },

    typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingBottom: 6 },
    typingText: { color: appColors.mutedDark, fontSize: 12.5 },

    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: whiteAlpha(0.08),
    },
    input: {
        flex: 1,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: goldAlpha(0.1),
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: appColors.white,
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: appColors.gold,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: { opacity: 0.4 },

    historyContainer: { flex: 1, backgroundColor: appColors.black },
    historyHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: whiteAlpha(0.08),
    },
    historyHeaderTitle: { color: appColors.white, fontSize: 18, fontWeight: "600" },
    newChatRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: goldAlpha(0.2),
    },
    newChatText: { color: appColors.gold, fontWeight: "600", fontSize: 14 },

    chatRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: appColors.cardBg,
        borderWidth: 1,
        borderColor: goldAlpha(0.1),
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
    },
    chatRowActive: { borderColor: appColors.gold },
    chatRowText: { flex: 1, marginRight: 10 },
    chatRowTitle: { color: appColors.white, fontSize: 14, fontWeight: "600" },
    chatRowTime: { color: appColors.mutedDark, fontSize: 11.5, marginTop: 3 },

    emptyHistoryText: { color: appColors.mutedDark, textAlign: "center", marginTop: 24 },
});