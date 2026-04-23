import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useChatContacts, useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const ChatPage = () => {
  const { user } = useAuth();
  const { data: contacts = [], isLoading: loadingContacts } = useChatContacts();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const { data: messages = [], isLoading: loadingMessages } = useChatMessages(selectedContactId);
  const sendMessage = useSendMessage();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Auto-select first contact
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedContactId) return;
    const text = message.trim();
    setMessage("");
    try {
      await sendMessage.mutateAsync({ receiverId: selectedContactId, content: text });
    } catch {
      setMessage(text); // restore on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-7rem)]">
        <div className="rounded-xl bg-card shadow-card h-full flex overflow-hidden">
          {/* Contact list */}
          <div className="w-72 border-r hidden md:flex flex-col">
            <div className="p-6 border-b glass">
              <h3 className="font-display font-black italic text-lg tracking-tighter uppercase">Mensajes</h3>
            </div>
            <div className="flex-1 overflow-auto">
              {loadingContacts ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  Sin contactos aún
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedContactId === c.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                      {getInitials(c.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.last_message || "Sin mensajes"}</p>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="h-5 w-5 rounded-full gradient-energy flex items-center justify-center text-[10px] font-bold text-energy-foreground">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                <div className="p-4 border-b flex items-center justify-between glass">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-black text-primary-foreground shadow-lg shadow-primary/20">
                      {getInitials(selectedContact.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-black font-display tracking-tight leading-none">{selectedContact.full_name.toUpperCase()}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">En línea</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-2/3 rounded-xl" />)}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">Envía el primer mensaje</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isMine
                                ? "gradient-primary text-primary-foreground rounded-br-md"
                                : "bg-accent rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t glass mt-auto flex items-center gap-2">
                  <Input
                    placeholder="Escribe un mensaje de poder..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-background/50 border-primary/10 h-11 focus-visible:ring-primary"
                  />
                  <Button
                    size="icon"
                    className="gradient-primary text-primary-foreground shrink-0 h-11 w-11 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessage.isPending}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm">Selecciona un contacto para chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ChatPage;
