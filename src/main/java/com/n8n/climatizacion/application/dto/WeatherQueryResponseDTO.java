package com.n8n.climatizacion.application.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherQueryResponseDTO {

  private Long id;
  private String city;
  private String country;
  private BigDecimal temperature;
  private String weatherCondition;
  private String recommendedClothes;
}
