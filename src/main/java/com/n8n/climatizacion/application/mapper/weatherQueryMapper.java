package com.n8n.climatizacion.application.mapper;

import com.n8n.climatizacion.domain.model.weatherQuery;
import com.n8n.climatizacion.infrastructure.entity.weatherQueryEntity;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Conversor centralizado entre el modelo de dominio y la entidad de
 * persistencia.
 */
public final class weatherQueryMapper {

  private weatherQueryMapper() {
  }

  public static weatherQueryEntity toEntity(weatherQuery domain) {
    if (domain == null) {
      return null;
    }
    weatherQueryEntity entity = new weatherQueryEntity();
    entity.setId(domain.getId());
    entity.setCity(domain.getCity());
    entity.setCountry(domain.getCountry());
    entity.setTemperature(domain.getTemperature());
    entity.setWeatherCondition(domain.getWeatherCondition());
    entity.setRecommendedClothes(domain.getRecommendedClothes());
    return entity;
  }

  public static weatherQuery toDomain(weatherQueryEntity entity) {
    if (entity == null) {
      return null;
    }
    return new weatherQuery(entity.getId(), entity.getCity(), entity.getCountry(),
        entity.getTemperature(), entity.getWeatherCondition(), entity.getRecommendedClothes());
  }

  public static List<weatherQuery> toDomainList(List<weatherQueryEntity> entities) {
    if (entities == null || entities.isEmpty()) {
      return Collections.emptyList();
    }
    return entities.stream().filter(Objects::nonNull).map(weatherQueryMapper::toDomain)
        .collect(Collectors.toList());
  }
}
