import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

/**
 * Generates RSA key pair for dev JWT signing.
 * Run: java GenerateKeyPair.java
 */
public class GenerateKeyPair {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        KeyPair kp = gen.generateKeyPair();

        String priv = Base64.getEncoder().encodeToString(kp.getPrivate().getEncoded());
        String pub  = Base64.getEncoder().encodeToString(kp.getPublic().getEncoded());

        StringBuilder privPem = new StringBuilder("-----BEGIN PRIVATE KEY-----\n");
        for (int i = 0; i < priv.length(); i += 64) {
            privPem.append(priv, i, Math.min(i + 64, priv.length())).append("\n");
        }
        privPem.append("-----END PRIVATE KEY-----");

        StringBuilder pubPem = new StringBuilder("-----BEGIN PUBLIC KEY-----\n");
        for (int i = 0; i < pub.length(); i += 64) {
            pubPem.append(pub, i, Math.min(i + 64, pub.length())).append("\n");
        }
        pubPem.append("-----END PUBLIC KEY-----");

        System.out.println("=== PRIVATE KEY ===");
        System.out.println(privPem);
        System.out.println("=== PUBLIC KEY ===");
        System.out.println(pubPem);

        java.nio.file.Files.writeString(java.nio.file.Path.of("privateKey.pem"), privPem.toString());
        java.nio.file.Files.writeString(java.nio.file.Path.of("publicKey.pem"),  pubPem.toString());
        System.out.println("Keys written to privateKey.pem and publicKey.pem");
    }
}
