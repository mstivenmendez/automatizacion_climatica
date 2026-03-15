package com.n8n.climatizacion.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class N8nWeatherResponseDTO {

  @JsonProperty("id")
  private Long id;

  @JsonProperty("city")
  private String city;

  @JsonProperty("country")
  private String country;

  @JsonProperty("temperature")
  private String temperature;

  @JsonProperty("weather_condition")
  private String weatherCondition;

  @JsonProperty("recommended_clothes")
  private String recommendedClothes;

  @JsonProperty("created_at")
  private String createdAt;
}
