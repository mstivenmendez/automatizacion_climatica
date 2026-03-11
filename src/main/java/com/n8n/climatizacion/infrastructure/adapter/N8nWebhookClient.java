package com.n8n.climatizacion.infrastructure.adapter;

import com.n8n.climatizacion.application.dto.N8nWeatherRequestDTO;
import com.n8n.climatizacion.application.dto.N8nWeatherResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class N8nWebhookClient {

  private final RestTemplate restTemplate;
  private final String webhookUrl;

  public N8nWebhookClient(
      RestTemplate restTemplate,
      @Value("${n8n.webhook.url}") String webhookUrl) {
    this.restTemplate = restTemplate;
    this.webhookUrl = webhookUrl;
  }

  public N8nWeatherResponseDTO callWeatherAdvice(String city) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    N8nWeatherRequestDTO body = new N8nWeatherRequestDTO(city);
    HttpEntity<N8nWeatherRequestDTO> request = new HttpEntity<>(body, headers);

    return restTemplate.postForObject(webhookUrl, request, N8nWeatherResponseDTO.class);
  }
}
