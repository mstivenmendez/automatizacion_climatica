package com.n8n.climatizacion.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "weather_queries")
public class weatherQueryEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String city;

  @Column(nullable = false, length = 100)
  private String country;

  @Column(nullable = false, precision = 5, scale = 2)
  private BigDecimal temperature;

  @Column(name = "weather_condition", nullable = false, length = 100)
  private String weatherCondition;

  @Column(name = "recommended_clothes", nullable = false, columnDefinition = "TEXT")
  private String recommendedClothes;

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
}
