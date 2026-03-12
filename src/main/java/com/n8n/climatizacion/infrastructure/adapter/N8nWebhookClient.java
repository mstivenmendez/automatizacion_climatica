package com.n8n.climatizacion.infrastructure.adapter;

import com.n8n.climatizacion.application.dto.N8nWeatherResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

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

  public List<N8nWeatherResponseDTO> callWeatherAdvice(String city) {
    URI uri = UriComponentsBuilder.fromUriString(webhookUrl)
        .queryParam("city", city)
        .build()
        .encode()
        .toUri();

    N8nWeatherResponseDTO[] response =
        restTemplate.getForObject(uri, N8nWeatherResponseDTO[].class);

    return response == null ? List.of() : Arrays.asList(response);
  }
}