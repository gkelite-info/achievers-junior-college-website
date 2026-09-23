import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bank, CreditCard, Eye, EyeSlash, Receipt, Wallet, X } from "@phosphor-icons/react";

const methods = [
  { name: "Credit / Debit Cards", icon: CreditCard },
  { name: "Net Banking", icon: Bank },
  { name: "UPI", icon: Receipt },
  { name: "Wallets", icon: Wallet },
] as const;

export default function PaymentPreview({
  onClose,
  applicantName = "Ramu Kumar",
  orderId = "AJC-2026-0001",
  amount = "500",
}: {
  onClose: () => void;
  applicantName?: string;
  orderId?: string;
  amount?: string;
}) {
  const [method, setMethod] = useState<string>("Credit / Debit Cards");
  const [showCode, setShowCode] = useState(false);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="max-w-[860px] mx-auto my-6 px-4 text-[#182336]" aria-labelledby="payment-heading">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#081D36] hover:text-[#0047A9] transition mb-3 cursor-pointer"
        onClick={onClose}
        aria-label="Back to application details"
        title="Back to application details"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Back to Application</span>
      </button>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-[#081D36] text-white rounded-t-xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#FFA401] flex items-center justify-center font-bold text-xs text-[#081D36]">
            AJ
          </span>
          <p className="text-sm font-bold text-white m-0">Achievers Junior College</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close payment and return to application"
          className="text-slate-300 hover:text-white cursor-pointer transition p-1"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 border border-slate-200 bg-white rounded-b-xl overflow-hidden shadow-lg">
        {/* Payment Methods Section */}
        <section className="md:col-span-8 p-6">
          <h1 id="payment-heading" ref={heading} tabIndex={-1} className="text-base font-bold text-[#081D36] mb-4">
            Payment Methods
          </h1>

          <nav className="flex gap-2 mb-6 border-b border-slate-200 pb-3 flex-wrap" aria-label="Payment methods">
            {methods.map(({ name, icon: Icon }) => (
              <button
                type="button"
                key={name}
                aria-pressed={method === name}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  method === name
                    ? "bg-[#081D36] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setMethod(name);
                  setMessage("");
                }}
              >
                <Icon size={18} />
                {name}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3.5">
            {method === "Credit / Debit Cards" && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Card Details</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400" aria-label="Visa, Mastercard, RuPay">
                    <span className="text-blue-600">VISA</span>
                    <span>●●</span>
                    <span className="text-emerald-600">RuPay</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input
                      readOnly
                      value="4111 1111 1111 1111"
                      aria-label="Sample card number"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      readOnly
                      value="12 / 28"
                      aria-label="Sample expiration date"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div className="relative">
                    <input
                      readOnly
                      type={showCode ? "text" : "password"}
                      value="123"
                      aria-label="Sample security code"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showCode ? "Hide security code" : "Show security code"}
                    >
                      {showCode ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Card holder name</label>
                  <input
                    readOnly
                    value={applicantName}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50"
                  />
                </div>
              </>
            )}

            {method === "Net Banking" && (
              <div className="flex flex-col gap-2">
                <label className="block text-[11px] font-medium text-slate-500">Select your bank</label>
                <select defaultValue="State Bank of India" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-white">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {method === "UPI" && (
              <div className="flex flex-col gap-2">
                <label className="block text-[11px] font-medium text-slate-500">UPI ID</label>
                <input
                  readOnly
                  value={`${applicantName.toLowerCase().replace(/\s+/g, ".")}@sample`}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-slate-50"
                />
                <p className="text-[11px] text-slate-400">Sample UPI details for this preview.</p>
              </div>
            )}

            {method === "Wallets" && (
              <div className="flex flex-col gap-2">
                <label className="block text-[11px] font-medium text-slate-500">Choose a wallet</label>
                <select defaultValue="PhonePe" className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-white">
                  <option>PhonePe</option>
                  <option>Paytm</option>
                  <option>Amazon Pay</option>
                </select>
              </div>
            )}

            <button
              type="button"
              className="w-full py-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-md transition cursor-pointer mt-2"
              onClick={() => setMessage("Demo payment complete. No money was charged.")}
            >
              Pay ₹{amount}
            </button>
            <p className="text-center text-[11px] text-slate-400">UI demo only · Sample payment details</p>
            {message && (
              <p role="status" className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center font-medium">
                {message}
              </p>
            )}
          </div>
        </section>

        {/* Summary Sidebar */}
        <aside className="md:col-span-4 p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#081D36] flex items-center gap-2 border-b border-slate-200 pb-2">
            <Receipt size={18} className="text-[#0047A9]" />
            Summary
          </h2>
          <dl className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <dt className="text-slate-500">Order ID</dt>
              <dd className="font-mono font-semibold text-slate-800">{orderId}</dd>
            </div>
            <div className="flex justify-between py-1.5 text-sm font-bold text-[#081D36]">
              <dt>Total Amount</dt>
              <dd className="text-emerald-600">₹{amount}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
