import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bank, CreditCard, Eye, EyeSlash, Receipt, Wallet, X } from "@phosphor-icons/react";
import styles from "./PaymentPreview.module.css";

const methods = [
  { name: "Credit / Debit Cards", icon: CreditCard },
  { name: "Net Banking", icon: Bank },
  { name: "UPI", icon: Receipt },
  { name: "Wallets", icon: Wallet },
] as const;

export default function PaymentPreview({ onClose, applicantName = "Ramu Kumar", orderId = "AJC-INTER-2026-00019", amount = "500" }: { onClose: () => void; applicantName?: string; orderId?: string; amount?: string }) {
  const [method, setMethod] = useState<string>("Credit / Debit Cards");
  const [showCode, setShowCode] = useState(false);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  return <section className={styles.page} aria-labelledby="payment-heading">
    <button type="button" className={styles.back} onClick={onClose} aria-label="Back to application details" title="Back to application details"><ArrowLeft size={26} aria-hidden="true" /></button>
    <header className={styles.merchant}>
      <span className={styles.logo}>AJ</span>
      <p>Achievers Junior College</p>
      <button type="button" onClick={onClose} aria-label="Close payment and return to application"><X size={22} /></button>
    </header>
    <div className={styles.layout}>
      <section className={styles.methods}>
        <h1 id="payment-heading" ref={heading} tabIndex={-1}>Payment Methods</h1>
        <div className={styles.methodLayout}>
          <nav className={styles.nav} aria-label="Payment methods">
            {methods.map(({ name, icon: Icon }) => <button type="button" key={name} aria-pressed={method === name} className={method === name ? styles.active : ""} onClick={() => { setMethod(name); setMessage(""); }}><Icon size={21} />{name === "UPI" ? <span className={styles.upi}>UPI</span> : name}</button>)}
          </nav>
          <div className={styles.fields}>
            {method === "Credit / Debit Cards" && <>
              <div className={styles.cardHeading}><h2>Card details</h2><div className={styles.brands} aria-label="Visa, Mastercard, RuPay"><span>VISA</span><span>●●</span><span>RuPay</span></div></div>
              <div className={styles.cardInputs}>
                <label className={styles.number}><span className={styles.srOnly}>Card number</span><input readOnly value="4111 1111 1111 1111" aria-label="Sample card number" /></label>
                <label><span className={styles.srOnly}>Expiration date</span><input readOnly value="12 / 28" aria-label="Sample expiration date" /></label>
                <div className={styles.security}><input readOnly type={showCode ? "text" : "password"} value="123" aria-label="Sample security code" /><button type="button" onClick={() => setShowCode(!showCode)} aria-label={showCode ? "Hide security code" : "Show security code"}>{showCode ? <EyeSlash size={20} /> : <Eye size={20} />}</button></div>
              </div>
              <label className={styles.field}>Card holder name<input readOnly value={applicantName} /></label>
            </>}
            {method === "Net Banking" && <><h2>Net Banking</h2><label className={styles.field}>Select your bank<select defaultValue="State Bank of India"><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option></select></label></>}
            {method === "UPI" && <><h2>Pay using UPI</h2><label className={styles.field}>UPI ID<input readOnly value={`${applicantName.toLowerCase().replace(/\s+/g, ".")}@sample`} /></label><p className={styles.hint}>Sample UPI details for this preview.</p></>}
            {method === "Wallets" && <><h2>Choose a wallet</h2><label className={styles.field}>Wallet<select defaultValue="PhonePe"><option>PhonePe</option><option>Paytm</option><option>Amazon Pay</option></select></label></>}
            <button type="button" className={styles.pay} onClick={() => setMessage("Demo payment complete. No money was charged.")}>Pay ₹{amount}</button>
            <p className={styles.hint}>UI demo only · Sample payment details</p>
            {message && <p role="status" className={styles.success}>{message}</p>}
          </div>
        </div>
      </section>
      <aside className={styles.summary} aria-labelledby="payment-summary-heading">
        <h2 id="payment-summary-heading"><Receipt size={20} />Summary</h2>
        <dl><div className={styles.order}><dt>Order ID</dt><dd>{orderId}</dd></div><div className={styles.total}><dt>Total Amount</dt><dd>₹{amount}</dd></div></dl>
      </aside>
    </div>
  </section>;
}
