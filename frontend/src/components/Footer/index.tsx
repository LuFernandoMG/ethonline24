import { FaGithub, FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";
import styles from "./Footer.module.scss";
import { FaX } from "react-icons/fa6";

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer_container}>
                <div className={`${styles.column} ${styles.description}`}>
                    <h3>About</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem necessitatibus incidunt blanditiis sint, numquam magni asperiores dolorem. Impedit quisquam eaque neque aliquid perferendis vel facilis corrupti. Inventore iure obcaecati ipsum.</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus officiis libero dolorem laudantium earum quia repellat voluptates accusantium quaerat, possimus soluta deserunt illo. Ipsam quidem nemo explicabo eius rem provident.</p>
                </div>
                <div className={`${styles.column} ${styles.tech_info}`}>
                    <h3>Technical View</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet ratione aut dolor non magni. Laborum, natus. Perferendis illum voluptate aliquam vitae? Rem maxime nisi reiciendis nihil dolor fugit repellendus impedit!</p>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Incidunt illo, voluptatum reprehenderit earum maiores quod, itaque laborum minus perferendis ipsam doloribus excepturi, unde laboriosam reiciendis dolorem tempore impedit possimus iusto.</p>
                </div>
                <div className={`${styles.column} ${styles.developer}`}>
                    <h3>Wanna know something about me?</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis ad maiores voluptas iste dignissimos magni iusto, cumque hic earum. Cumque quo voluptatibus expedita facere ab. Obcaecati nemo dolores quisquam accusamus.</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem reiciendis incidunt excepturi ipsum asperiores eum molestiae ut non iusto, saepe dolorem quae numquam nesciunt explicabo doloremque minima ducimus neque. Quos.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;