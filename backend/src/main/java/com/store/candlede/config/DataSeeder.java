package com.store.candlede.config;

import com.store.candlede.entity.Category;
import com.store.candlede.entity.InstitutionalContent;
import com.store.candlede.entity.Product;
import com.store.candlede.repository.CategoryRepository;
import com.store.candlede.repository.InstitutionalContentRepository;
import com.store.candlede.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final InstitutionalContentRepository contentRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedContent();
        backfillCategorySlugs();
        backfillProductLines();
    }

    // =========================================================
    // 1. CONTEÚDO INSTITUCIONAL
    // =========================================================
    private void seedContent() {
        List<InstitutionalContent> seeds = List.of(
            // ---------- JÁ EXISTENTES (institucional) ----------
            build("sobre", "Sobre a Candlede",
                "A Candlede nasceu do desejo de transformar o cotidiano em algo mais sensível..."),
            build("entrega", "Entrega e envio",
                "Enviamos para todo o Brasil. O prazo varia conforme a região..."),
            build("pagamento", "Pagamentos",
                "Aceitamos PIX e cartão de crédito/débito."),
            build("privacidade", "Privacidade",
                "Seus dados são usados apenas para processar pedidos..."),
            build("termos", "Termos de uso",
                "Ao usar a Candlede você concorda com nossos termos..."),
            build("contato", "Contato",
                "Fale conosco pelo e-mail candlede@gmail.com."),

            // =========================================================
            // NOVOS — Seção "Linha de Cuidados" da HOME
            // =========================================================
            build("home_ritual_eyebrow",     "Ritual",          "Ritual"),
            build("home_ritual_title",       "Linha de Cuidados","Linha de Cuidados"),
            build("home_ritual_text",        "Texto do ritual",
                "Cada produto foi pensado como um pequeno ritual. Aromas que convidam à pausa, ao cuidado e à presença."),
            build("home_ritual_button_text", "Texto do botão",  "Conhecer coleção"),
            build("home_ritual_button_link", "Link do botão",   "/produtos"),
            build("home_ritual_image",       "Imagem da seção", "/images/editorial-1.jpg"),

            // =========================================================
            // NOVOS — Página SOBRE
            // =========================================================
            build("sobre_andre_nome",   "Nome do fundador", "André Dantas"),
            build("sobre_andre_cargo",  "Cargo",            "Perfumista"),
            build("sobre_andre_texto",  "História do fundador",
                "A Candlede nasceu do desejo de transformar o cotidiano em algo mais sensível. Cada aroma é escolhido com calma, testado com atenção e produzido em pequenas quantidades — porque acreditamos que o tempo é parte do que faz uma fragrância ser boa."),
            build("sobre_andre_imagem", "Foto do fundador", "/images/andre.jpg"),

            build("sobre_manifesto_p1", "Parágrafo 1 do manifesto",
                "Acreditamos que um aroma tem o poder de mudar a atmosfera de um ambiente e, com ela, o nosso estado de espírito."),
            build("sobre_manifesto_p2", "Parágrafo 2 do manifesto",
                "Trabalhamos com ceras vegetais, óleos essenciais e matérias-primas escolhidas com cuidado, em lotes pequenos e feitos à mão."),

            build("sobre_pessoal_imagem",  "Foto pessoal",    "/images/pessoal.jpg"),
            build("sobre_pessoal_caption", "Legenda pessoal", "Te amo"),
            build("sobre_pessoal_texto",   "Texto pessoal",
                "Essa marca também é sobre as pessoas que estiveram comigo desde o começo.")
        );

        for (InstitutionalContent item : seeds) {
            if (!contentRepository.existsByKey(item.getKey())) {
                contentRepository.save(item);
            }
        }
    }

    // =========================================================
    // Helper que cria o InstitutionalContent
    // =========================================================
    private InstitutionalContent build(String key, String title, String content) {
        return InstitutionalContent.builder()
                .key(key)
                .title(title)
                .content(content)
                .active(true)
                .build();
    }

    // =========================================================
    // 2. BACKFILL DE SLUG EM CATEGORIAS SEM SLUG
    // =========================================================
    private void backfillCategorySlugs() {
        List<Category> semSlug = categoryRepository.findAll().stream()
                .filter(c -> c.getSlug() == null || c.getSlug().isBlank())
                .toList();

        for (Category c : semSlug) {
            String slug = slugify(c.getName());
            String tentativa = slug;
            int i = 1;
            while (categoryRepository.findBySlug(tentativa).isPresent()) {
                tentativa = slug + "-" + i++;
            }
            c.setSlug(tentativa);
            categoryRepository.save(c);
        }
    }

    private String slugify(String text) {
        return text.toLowerCase()
                .replaceAll("[áàâãä]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i")
                .replaceAll("[óòôõö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    // =========================================================
    // 3. BACKFILL DE LINE EM PRODUTOS SEM LINE
    // =========================================================
    private void backfillProductLines() {
        List<Product> semLine = productRepository.findAll().stream()
                .filter(p -> p.getLine() == null || p.getLine().isBlank())
                .toList();

        for (Product p : semLine) {
            p.setLine("Linha care");
            productRepository.save(p);
        }
    }
}