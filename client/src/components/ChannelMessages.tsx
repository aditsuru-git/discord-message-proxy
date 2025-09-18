import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { fetchMessages, selectAllMessages, selectMessagesStatus, selectBotId } from "../store/features/messagesSlice";
import { socket } from "../api/socket";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquareReply, SmilePlus, Pencil, Trash2 } from "lucide-react";

interface SimpleMessage {
	id: string;
	content: string;
	author: {
		id: string;
		username: string;
		discriminator: string;
		avatar: string | null;
	};
	timestamp: number;
	editedTimestamp: number | null;
	reactions?: {
		emoji: string;
		count: number;
		users?: string[];
	}[];
}

const MessageInput = ({ channelId, replyingTo, setReplyingTo }: any) => {
	const [messageText, setMessageText] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = () => {
		if (messageText.trim() === "") return;
		if (replyingTo) {
			socket.emit("replyMessage", {
				channelId,
				messageId: replyingTo.id,
				content: messageText,
			});
			setReplyingTo(null);
		} else {
			socket.emit("sendMessage", { channelId, content: messageText });
		}
		setMessageText("");
	};

	return (
		<div className="p-4 border-t border-slate-600 bg-slate-700">
			{replyingTo && (
				<div className="relative p-2 mb-2 bg-slate-600 border border-slate-500 rounded-lg">
					<div className="text-sm text-slate-400">Replying to **{replyingTo.author.username}**</div>
					<div className="text-sm truncate">{replyingTo.content}</div>
					<button
						onClick={() => setReplyingTo(null)}
						className="absolute top-2 right-2 text-slate-400 hover:text-white"
					>
						&times;
					</button>
				</div>
			)}
			<div className={`bg-slate-600 border border-slate-500 focus-within:border-blue-500 transition-colors rounded-lg`}>
				<textarea
					ref={textareaRef}
					value={messageText}
					onChange={(e) => setMessageText(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder={`Message #${channelId || "general"}`}
					className="w-full bg-transparent text-white placeholder-slate-400 p-3 pr-20 resize-none focus:outline-none min-h-[44px] max-h-32"
					rows={1}
				/>
				<div className="absolute right-3 bottom-2.5">
					<button
						type="button"
						className="p-1 hover:bg-slate-500 rounded transition-colors cursor-pointer"
						onClick={handleSendMessage}
					>
						<svg className="w-5 h-5 text-slate-400 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 00.957 1.444h14a1 1 0 00.957-1.444l-7-14z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

const ReactionButton = ({ emoji, count, isBotReacted, onToggle }: any) => {
	return (
		<button
			onClick={() => onToggle(emoji)}
			className={`flex items-center space-x-1.5 pl-2.5 pr-3 py-1 text-sm rounded-full border transition-all duration-200 ease-in-out
				${
					isBotReacted
						? "bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30"
						: "bg-slate-700/60 border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-300"
				}`}
		>
			<span>{emoji}</span>
			<span className="font-medium">{count}</span>
		</button>
	);
};

function ChannelMessages() {
	const { channelId } = useParams<{ channelId: string }>();
	const dispatch: AppDispatch = useDispatch();
	const messages = useSelector(selectAllMessages);
	const messagesStatus = useSelector(selectMessagesStatus);
	const botId = useSelector(selectBotId);
	const [replyingTo, setReplyingTo] = useState<SimpleMessage | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [pickerMessageId, setPickerMessageId] = useState<string | null>(null);
	const [editingMessage, setEditingMessage] = useState<SimpleMessage | null>(null);
	const [editedContent, setEditedContent] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (channelId) {
			dispatch(fetchMessages(channelId));
		}
	}, [channelId, dispatch]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleToggleReaction = (messageId: string, emoji: string) => {
		const message = messages.find((msg) => msg.id === messageId);
		if (!message) return;
		const reaction = message.reactions?.find((r) => r.emoji === emoji);
		const hasBotReacted = reaction?.users?.includes(botId!);
		if (hasBotReacted) {
			socket.emit("removeReaction", { channelId, messageId, emoji });
		} else {
			socket.emit("addReaction", { channelId, messageId, emoji });
		}
		setShowEmojiPicker(false);
	};

	const handleDeleteMessage = (messageId: string) => {
		if (window.confirm("Are you sure you want to delete this message?")) {
			socket.emit("deleteMessage", { channelId, messageId });
		}
	};

	const handleEditMessage = (message: SimpleMessage) => {
		setEditingMessage(message);
		setEditedContent(message.content);
	};

	const handleSaveEdit = () => {
		if (editingMessage && editedContent.trim() !== "") {
			socket.emit("editMessage", {
				channelId,
				messageId: editingMessage.id,
				content: editedContent,
			});
			setEditingMessage(null);
			setEditedContent("");
		}
	};

	const handleCancelEdit = () => {
		setEditingMessage(null);
		setEditedContent("");
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString();
	};

	return (
		<div className="flex flex-col h-screen">
			<div className="h-12 px-4 flex items-center justify-between border-b border-slate-600 shadow-sm bg-slate-800">
				<h2 className="font-semibold text-white">
					#{messagesStatus === "succeeded" && messages.length > 0 ? messages[0].channelName : channelId}
				</h2>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messagesStatus === "loading" && <div className="text-center text-slate-400">Loading messages...</div>}
				{messagesStatus === "failed" && <div className="text-center text-red-400">Failed to load messages.</div>}
				{messages.map((message) => {
					const isBotMessage = message.author.id === botId;
					const userAvatarUrl =
						message.author.avatar ||
						`https://cdn.discordapp.com/embed/avatars/${parseInt(message.author.discriminator) % 5}.png`;
					return (
						<div
							key={message.id}
							className="relative group px-4 py-1.5 -mx-4 rounded-md hover:bg-slate-800/50 transition-colors"
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<img
										className="h-10 w-10 rounded-full bg-slate-600"
										src={userAvatarUrl}
										alt={message.author.username}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline space-x-2">
										<div className="text-sm font-semibold text-white">{message.author.username}</div>
										<div className="text-xs text-slate-400">{formatTimestamp(message.timestamp)}</div>
										{message.editedTimestamp && <div className="text-xs text-slate-500">(edited)</div>}
									</div>
									{editingMessage?.id === message.id ? (
										<div>
											<textarea
												value={editedContent}
												onChange={(e) => setEditedContent(e.target.value)}
												className="w-full p-2 text-white bg-slate-600 rounded"
											/>
											<div className="mt-2 space-x-2">
												<button
													onClick={handleSaveEdit}
													className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600"
												>
													Save
												</button>
												<button
													onClick={handleCancelEdit}
													className="px-3 py-1 text-sm text-white bg-slate-500 rounded hover:bg-slate-600"
												>
													Cancel
												</button>
											</div>
										</div>
									) : (
										<div className="prose prose-sm prose-invert mt-1">
											<ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
										</div>
									)}
									<div className="flex flex-wrap gap-2 mt-2">
										{message.reactions?.map((reaction) => (
											<ReactionButton
												key={reaction.emoji}
												emoji={reaction.emoji}
												count={reaction.count}
												isBotReacted={reaction.users?.includes(botId!)}
												onToggle={(emoji: string) => handleToggleReaction(message.id, emoji)}
											/>
										))}
									</div>
								</div>
							</div>
							<div className="absolute right-4 top-0 flex items-center justify-end space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 border border-slate-700 shadow-lg rounded-lg p-0.5">
								<button
									onClick={() => setReplyingTo(message)}
									className="p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded"
									title="Reply"
								>
									<MessageSquareReply className="h-4 w-4" />
								</button>
								<button
									onClick={() => {
										setPickerMessageId(message.id);
										setShowEmojiPicker(!showEmojiPicker);
									}}
									className="p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded"
									title="Add Reaction"
								>
									<SmilePlus className="h-4 w-4" />
								</button>
								{isBotMessage && (
									<>
										<button
											onClick={() => handleEditMessage(message)}
											className="p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded"
											title="Edit"
										>
											<Pencil className="h-4 w-4" />
										</button>
										<button
											onClick={() => handleDeleteMessage(message.id)}
											className="p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 rounded"
											title="Delete"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</>
								)}
							</div>
							{showEmojiPicker && pickerMessageId === message.id && (
								<div ref={pickerRef} className="absolute right-0 top-8 z-10">
									<EmojiPicker
										onEmojiClick={(emojiData: EmojiClickData) => handleToggleReaction(message.id, emojiData.emoji)}
									/>
								</div>
							)}
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			<MessageInput channelId={channelId} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
		</div>
	);
}

export default ChannelMessages;
