package com.n8n.climatizacion.application.service;

import com.n8n.climatizacion.application.dto.WeatherQueryRequestDTO;
import com.n8n.climatizacion.application.dto.WeatherQueryResponseDTO;
import com.n8n.climatizacion.domain.model.weatherQuery;
import com.n8n.climatizacion.domain.util.weatherQueryPort;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class WeatherQueryService {

  private final weatherQueryPort port;

  public WeatherQueryService(weatherQueryPort port) {
    this.port = port;
  }

  public WeatherQueryResponseDTO registerQuery(WeatherQueryRequestDTO request, weatherQuery enrichedData) {
    Assert.notNull(request, "request must not be null");
    Assert.notNull(enrichedData, "enriched data must not be null");

    enrichedData.setCity(request.getCity());
    enrichedData.setCountry(request.getCountry());
    weatherQuery saved = port.create(enrichedData);
    return toResponse(saved);
  }

  public WeatherQueryResponseDTO getById(Long id) {
    weatherQuery query = Optional.ofNullable(port.readById(id))
        .orElseThrow(() -> new IllegalArgumentException("Weather query not found"));
    return toResponse(query);
  }

  public List<WeatherQueryResponseDTO> listAll() {
    return toResponseList(port.listAll());
  }

  public List<WeatherQueryResponseDTO> listRecent(int limit) {
    return toResponseList(port.listRecent(limit));
  }

  public List<WeatherQueryResponseDTO> findByCity(String city) {
    return toResponseList(port.findByCity(city));
  }

  public List<WeatherQueryResponseDTO> findByCountry(String country) {
    return toResponseList(port.findByCountry(country));
  }

  public List<WeatherQueryResponseDTO> searchByCityOrCountry(String query) {
    return toResponseList(port.searchByCityOrCountry(query));
  }

  private WeatherQueryResponseDTO toResponse(weatherQuery query) {
    return WeatherQueryResponseDTO.builder()
        .id(query.getId())
        .city(query.getCity())
        .country(query.getCountry())
        .temperature(query.getTemperature())
        .weatherCondition(query.getWeatherCondition())
        .recommendedClothes(query.getRecommendedClothes())
        .build();
  }

  private List<WeatherQueryResponseDTO> toResponseList(Iterable<weatherQuery> queries) {
    if (queries == null) {
      return List.of();
    }
    return StreamSupport.stream(queries.spliterator(), false)
        .map(this::toResponse)
        .collect(Collectors.toList());
  }
}
