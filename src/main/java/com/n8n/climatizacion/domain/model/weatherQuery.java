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
   * Reconstruye la entidad con todos los datos provenientes de una capa de
   * persistencia o de un DTO completo.
   */
  public void reconstruct(Long id, String city, String country, BigDecimal temperature,
      String weatherCondition, String recommendedClothes) {
    this.id = id;
    this.city = city;
    this.country = country;
    this.temperature = temperature;
    this.weatherCondition = weatherCondition;
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

  public boolean matchesCity(String city) {
    return city != null && this.city != null && this.city.equalsIgnoreCase(city);
  }

  public boolean matchesCountry(String country) {
    return country != null && this.country != null && this.country.equalsIgnoreCase(country);
  }

}
