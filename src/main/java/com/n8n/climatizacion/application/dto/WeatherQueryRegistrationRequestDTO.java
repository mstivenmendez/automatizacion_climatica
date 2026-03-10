package com.n8n.climatizacion.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherQueryRegistrationRequestDTO {

  @NotBlank
  @Size(max = 100)
  private String city;

  @NotBlank
  @Size(max = 100)
  private String country;

  @NotNull
  private BigDecimal temperature;

  @NotBlank
  @Size(max = 100)
  private String weatherCondition;

  @NotBlank
  private String recommendedClothes;
}
