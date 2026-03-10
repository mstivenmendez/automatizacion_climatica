package com.n8n.climatizacion.domain.model;

import java.math.BigDecimal;

/**
 * Representa una consulta meteorologica almacenada en la tabla weather_queries.
 */
public class weatherQuery {

  private Long id;
  private String city;
  private String country;
  private BigDecimal temperature;
  private String weatherCondition;
  private String recommendedClothes;

  public weatherQuery() {
  }

  public weatherQuery(Long id, String city, String country, BigDecimal temperature,
      String weatherCondition, String recommendedClothes) {
    this.id = id;
    this.city = city;
    this.country = country;
    this.temperature = temperature;
    this.weatherCondition = weatherCondition;
    this.recommendedClothes = recommendedClothes;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public BigDecimal getTemperature() {
    return temperature;
  }

  public void setTemperature(BigDecimal temperature) {
    this.temperature = temperature;
  }

  public String getWeatherCondition() {
    return weatherCondition;
  }

  public void setWeatherCondition(String weatherCondition) {
    this.weatherCondition = weatherCondition;
  }

  public String getRecommendedClothes() {
    return recommendedClothes;
  }

  public void setRecommendedClothes(String recommendedClothes) {
    this.recommendedClothes = recommendedClothes;
  }

  /**
   * Permite actualizar la informacion meteorologica y la recomendacion asociada
   * cuando llega una nueva lectura.
   */
  public void updateWeatherDetails(BigDecimal temperature, String weatherCondition,
      String recommendedClothes) {
    if (temperature != null) {
      this.temperature = temperature;
    }
    if (weatherCondition != null && !weatherCondition.isBlank()) {
      this.weatherCondition = weatherCondition;
    }
    if (recommendedClothes != null && !recommendedClothes.isBlank()) {
      this.recommendedClothes = recommendedClothes;
    }
  }

  public boolean isSameLocation(String city, String country) {
    if (city == null || country == null) {
      return false;
    }
    return city.equalsIgnoreCase(this.city) && country.equalsIgnoreCase(this.country);
  }

  /**
   * Reglas simples de negocio para detectar si se necesita ropa abrigada.
   */
  public boolean requiresColdWeatherOutfit() {
    return temperature != null && temperature.compareTo(BigDecimal.valueOf(18)) < 0;
  }

  public boolean shouldCarryUmbrella() {
    if (weatherCondition == null) {
      return false;
    }
    String normalized = weatherCondition.toLowerCase();
    return normalized.contains("rain") || normalized.contains("lluvia");
  }
}
