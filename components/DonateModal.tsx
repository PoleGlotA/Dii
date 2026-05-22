"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Coins, ExternalLink, Heart } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import { Button, LinkButton } from "@/components/ui/Button";
import type { Post } from "@/types";

interface DonateModalProps {
  open: boolean;
  post: Post;
  onClose: () => void;
}

const QUICK = [200, 500, 1000, 2000, 5000];

export function DonateModal({ open, post, onClose }: DonateModalProps) {
  const { state, addDonation } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [step, setStep] = useState<"amount" | "confirm">("amount");

  useEffect(() => {
    if (!open) {
      setStep("amount");
      setAmount(500);
      setCustom("");
      setMessage("");
      setAnonymous(false);
    }
  }, [open]);

  if (!open) return null;

  const finalAmount = custom ? Math.max(0, Math.floor(Number(custom))) : amount;

  function handleConfirmed() {
    if (!state.currentUser) {
      router.push("/auth");
      return;
    }
    if (finalAmount < 10) {
      toast.push("Мінімальний донат — 10 грн", "error");
      return;
    }
    addDonation(post.id, finalAmount, message || undefined, anonymous);
    toast.push(`Дякуємо за ${formatCurrency(finalAmount)}!`, "success");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-elev-4 animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-h3 text-gray-900">Підтримати збір</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        {step === "amount" ? (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Сума донату</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {QUICK.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAmount(v); setCustom(""); }}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      !custom && amount === v
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {v} грн
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  placeholder="Інша сума..."
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">грн</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Слово підтримки <span className="text-gray-400">(необов'язково)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Хай горять довше..."
                rows={2}
                maxLength={140}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{message.length}/140</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Анонімний донат</span>
            </label>

            <div className="bg-warning-50 border border-warning-100 rounded-xl p-3 text-xs text-warning-800 flex gap-2">
              <Heart size={14} className="shrink-0 mt-0.5" />
              <span>
                Це фіксація донату для статистики. Реальний переказ потрібно зробити через посилання
                нижче. Будь чесним — вкажи реальну суму після того, як переказав.
              </span>
            </div>

            <Button fullWidth size="lg" onClick={() => setStep("confirm")} icon={<Coins size={16} />}>
              Підтримати {formatCurrency(finalAmount || 0)}
            </Button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-100 mx-auto mb-3 flex items-center justify-center">
                <ExternalLink size={20} className="text-brand-600" />
              </div>
              <h3 className="text-h3 text-gray-900 mb-1">Крок 1: зробіть переказ</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Відкрийте посилання на банку, переказуйте {formatCurrency(finalAmount)}, поверніться сюди.
              </p>
            </div>

            {post.fundingLink && (
              <LinkButton
                href={post.fundingLink}
                target="_blank"
                rel="noopener noreferrer"
                variant="success"
                fullWidth
                size="lg"
                iconTrailing={<ExternalLink size={14} />}
              >
                Відкрити банку
              </LinkButton>
            )}

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
              <div className="text-center">
                <h3 className="text-h3 text-gray-900 mb-1">Крок 2: підтвердьте</h3>
                <p className="text-sm text-gray-500">
                  Це додасть {formatCurrency(finalAmount)} до прогресу збору.
                </p>
              </div>
              <Button fullWidth variant="primary" size="lg" onClick={handleConfirmed}>
                Я переказав(-ла) {formatCurrency(finalAmount)}
              </Button>
              <Button fullWidth variant="ghost" onClick={() => setStep("amount")}>
                Назад
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
