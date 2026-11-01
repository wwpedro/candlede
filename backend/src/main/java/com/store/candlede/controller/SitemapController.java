package com.store.candlede.controller;

import com.store.candlede.entity.Product;
import com.store.candlede.entity.Category;
import com.store.candlede.repository.ProductRepository;
import com.store.candlede.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final String DOMAIN = "https://candlede.com.br";

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        xml.append(buildUrl(DOMAIN + "/", "1.0", "daily"));
        xml.append(buildUrl(DOMAIN + "/produtos", "0.9", "weekly"));
        xml.append(buildUrl(DOMAIN + "/sobre", "0.5", "monthly"));
        xml.append(buildUrl(DOMAIN + "/contato", "0.5", "monthly"));

        List<Category> categories = categoryRepository.findByActiveTrueOrderByNameAsc();
        for (Category cat : categories) {
            xml.append(buildUrl(DOMAIN + "/categorias/" + cat.getSlug(), "0.8", "weekly"));
        }

        List<Product> products = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        for (Product prod : products) {
            xml.append(buildUrl(DOMAIN + "/produto/" + prod.getId(), "0.8", "weekly"));
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    private String buildUrl(String url, String priority, String freq) {
        return "  <url>\n" +
                "    <loc>" + url + "</loc>\n" +
                "    <changefreq>" + freq + "</changefreq>\n" +
                "    <priority>" + priority + "</priority>\n" +
                "  </url>\n";
    }
}