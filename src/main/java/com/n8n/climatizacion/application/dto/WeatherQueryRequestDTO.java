package com.n8n.climatizacion.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherQueryRequestDTO {

  @NotBlank
  @Size(max = 100)
  private String city;

  @NotBlank
  @Size(max = 100)
  private String country;
}
