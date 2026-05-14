import styles from "../ui/polish.module.css";

const message = "Doei sangue hoje ❤️ Ajude também a salvar vidas com Doe Sangue Angola.";
const encoded = encodeURIComponent(message);

const links = [
  ["WhatsApp", `https://wa.me/?text=${encoded}`, styles.whatsapp],
  ["X", `https://twitter.com/intent/tweet?text=${encoded}`, styles.x],
  ["Facebook", `https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, styles.facebook],
  ["Instagram", "#", styles.instagram]
];

export function SocialSharePanel() {
  return (
    <section className={styles.sharePanel}>
      <strong>Compartilhe e inspire mais pessoas</strong>
      <p className="muted">{message}</p>
      <div className={styles.shareGrid}>
        {links.map(([label, href, tone]) => (
          <a className={`${styles.shareButton} ${tone}`} href={href} key={label}>
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
