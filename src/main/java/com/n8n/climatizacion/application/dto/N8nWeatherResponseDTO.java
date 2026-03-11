package com.n8n.climatizacion.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class N8nWeatherResponseDTO {

  private String city;
  private String country;
  private double temperature;

  @JsonProperty("feels_like")
  private double feelsLike;

  private int humidity;
  private String description;
  private String icon;

  @JsonProperty("wind_speed")
  private double windSpeed;

  private List<String> alerts;
  private String recommendation;

  @JsonProperty("queried_at")
  private String queriedAt;
}
