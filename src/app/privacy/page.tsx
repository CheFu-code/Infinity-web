import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Infinity",
  description: "Privacy policy for the Infinity game by CheFu Technologies.",
};

export default function PrivacyPage() {
  return <main className="policy-page"><Link className="policy-back" href="/">← Back to Infinity</Link><p className="eyebrow"><span className="eyebrow-dot" /> CheFu Technologies</p><h1>Privacy<br /><em>policy.</em></h1><p className="policy-updated">Last updated: August 26, 2026</p><div className="policy-copy">
    <p>Infinity is a number puzzle game created by CheFu Technologies. This policy explains what information we collect, how we use it, and the choices available to you.</p>
    <h2>Information we collect</h2><p>You can play Infinity without an account. When you sign in, we receive the basic account details provided by our authentication service, such as your name, email address, and profile image. We store your Infinity game state, including your score, board, achievements, settings, and undo history, so it can be restored on another device.</p>
    <h2>How we use information</h2><p>We use this information to authenticate you, synchronize your game progress, provide the requested service, and maintain the security and reliability of Infinity. We do not sell your personal information or use your game history for advertising.</p>
    <h2>Storage and security</h2><p>Signed-in game data is stored in our backend services and associated with your account. Authentication credentials are handled by the authentication provider; Infinity stores session information securely on your device. We use reasonable technical and organizational safeguards, although no internet service can guarantee absolute security.</p>
    <h2>Your choices</h2><p>You may play without signing in, sign out at any time, or ask us to delete your account data. To request access or deletion, contact us at <a href="mailto:privacy@chefu.co.za">privacy@chefu.co.za</a>.</p>
    <h2>Children&apos;s privacy</h2><p>Infinity is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
    <h2>Changes to this policy</h2><p>We may update this policy as Infinity changes. The date at the top of this page indicates when it was most recently revised.</p>
    <h2>Contact</h2><p>Questions about this policy can be sent to <a href="mailto:privacy@chefu.co.za">privacy@chefu.co.za</a>.</p>
  </div></main>;
}
