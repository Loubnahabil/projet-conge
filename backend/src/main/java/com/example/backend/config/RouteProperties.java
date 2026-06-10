package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "routes")
@PropertySource(value = "classpath:routes-config.yml", factory = YamlPropertySourceFactory.class)
public class RouteProperties {

    private List<String> publicUrls;
    private List<RouteRule> demandeUrls;
    private List<RouteRule> fonctionnaireUrls;
    private List<RouteRule> chefUrls;
    private List<RouteRule> signataireUrls;
    private List<RouteRule> adminUrls;
    private List<RouteRule> authenticatedUrls;

    public List<String> getPublicUrls() { return publicUrls; }
    public void setPublicUrls(List<String> publicUrls) { this.publicUrls = publicUrls; }

    public List<RouteRule> getDemandeUrls() { return demandeUrls; }
    public void setDemandeUrls(List<RouteRule> demandeUrls) { this.demandeUrls = demandeUrls; }

    public List<RouteRule> getFonctionnaireUrls() { return fonctionnaireUrls; }
    public void setFonctionnaireUrls(List<RouteRule> fonctionnaireUrls) { this.fonctionnaireUrls = fonctionnaireUrls; }

    public List<RouteRule> getChefUrls() { return chefUrls; }
    public void setChefUrls(List<RouteRule> chefUrls) { this.chefUrls = chefUrls; }

    public List<RouteRule> getSignataireUrls() { return signataireUrls; }
    public void setSignataireUrls(List<RouteRule> signataireUrls) { this.signataireUrls = signataireUrls; }

    public List<RouteRule> getAdminUrls() { return adminUrls; }
    public void setAdminUrls(List<RouteRule> adminUrls) { this.adminUrls = adminUrls; }

    public List<RouteRule> getAuthenticatedUrls() { return authenticatedUrls; }
    public void setAuthenticatedUrls(List<RouteRule> authenticatedUrls) { this.authenticatedUrls = authenticatedUrls; }

    public List<RouteRule> getAllRules() {
        List<RouteRule> all = new ArrayList<>();
        if (authenticatedUrls != null) all.addAll(authenticatedUrls);
        if (signataireUrls != null) all.addAll(signataireUrls);
        if (chefUrls != null) all.addAll(chefUrls);
        if (fonctionnaireUrls != null) all.addAll(fonctionnaireUrls);
        if (adminUrls != null) all.addAll(adminUrls);
        if (demandeUrls != null) all.addAll(demandeUrls);
        return all;
    }

    public static class RouteRule {
        private String pattern;
        private String method = "ANY";
        private List<String> roles;

        public String getPattern() { return pattern; }
        public void setPattern(String pattern) { this.pattern = pattern; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
    }
}
