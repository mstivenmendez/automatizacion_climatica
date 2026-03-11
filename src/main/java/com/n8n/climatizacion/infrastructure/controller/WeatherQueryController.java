package com.n8n.climatizacion.infrastructure.controller;

import com.n8n.climatizacion.application.dto.N8nWeatherRequestDTO;
import com.n8n.climatizacion.application.dto.N8nWeatherResponseDTO;
import com.n8n.climatizacion.application.dto.WeatherQueryRegistrationRequestDTO;
import com.n8n.climatizacion.application.dto.WeatherQueryRequestDTO;
import com.n8n.climatizacion.application.dto.WeatherQueryResponseDTO;
import com.n8n.climatizacion.application.service.WeatherQueryService;
import com.n8n.climatizacion.domain.model.weatherQuery;
import com.n8n.climatizacion.infrastructure.adapter.N8nWebhookClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@Validated
@Tag(name = "Weather queries", description = "Historial de consultas climaticas y recomendaciones")
public class WeatherQueryController {

  private final WeatherQueryService service;
  private final N8nWebhookClient n8nClient;

  public WeatherQueryController(WeatherQueryService service, N8nWebhookClient n8nClient) {
    this.service = service;
    this.n8nClient = n8nClient;
  }

  @PostMapping("/weather-advice")
  @Operation(summary = "Consultar clima vía n8n", description = "Recibe una ciudad, llama al webhook de n8n para obtener datos climáticos y recomendación de IA, y retorna la respuesta al frontend")
  public ResponseEntity<N8nWeatherResponseDTO> getWeatherAdvice(
      @RequestBody N8nWeatherRequestDTO request) {
    N8nWeatherResponseDTO response = n8nClient.callWeatherAdvice(request.getCity());
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(summary = "Registrar una consulta", description = "Almacena ciudad, pais, datos meteorologicos y la recomendacion generada", responses = {
      @ApiResponse(responseCode = "201", description = "Consulta registrada", content = @Content(schema = @Schema(implementation = WeatherQueryResponseDTO.class))),
      @ApiResponse(responseCode = "400", description = "Datos invalidos", content = @Content)
  })
  public ResponseEntity<WeatherQueryResponseDTO> register(
      @Valid @RequestBody WeatherQueryRegistrationRequestDTO request) {
    WeatherQueryRequestDTO baseRequest = WeatherQueryRequestDTO.builder()
        .city(request.getCity())
        .country(request.getCountry())
        .build();

    weatherQuery enriched = toDomain(request);
    WeatherQueryResponseDTO response = service.registerQuery(baseRequest, enriched);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping("/search")
  @Operation(summary = "Buscar coincidencias por ciudad o pais", description = "Devuelve hasta 10 registros cuyo pais o ciudad comienza con el prefijo dado", responses = {
      @ApiResponse(responseCode = "200", description = "Coincidencias encontradas", content = @Content(schema = @Schema(implementation = WeatherQueryResponseDTO.class)))
  })
  public List<WeatherQueryResponseDTO> searchByCityOrCountry(
      @Parameter(description = "Prefijo de busqueda") @RequestParam("query") String query) {
    if (!StringUtils.hasText(query)) {
      return List.of();
    }
    return service.searchByCityOrCountry(query.trim());
  }

  @GetMapping("/recent")
  @Operation(summary = "Listar consultas recientes", description = "Devuelve el ultimo N de registros ordenados por fecha de insercion")
  public List<WeatherQueryResponseDTO> listRecent(
      @Parameter(description = "Cantidad de registros a retornar") @RequestParam(name = "limit", defaultValue = "10") int limit) {
    int safeLimit = limit <= 0 ? 10 : limit;
    return service.listRecent(safeLimit);
  }

  @GetMapping("/cities")
  @Operation(summary = "Autocomplete de ciudades", description = "Devuelve hasta 10 ciudades que comienzan con el prefijo indicado")
  public List<WeatherQueryResponseDTO> findByCity(
      @Parameter(description = "Prefijo de la ciudad") @RequestParam("query") String query) {
    if (!StringUtils.hasText(query)) {
      return List.of();
    }
    return service.findByCity(query.trim());
  }

  @GetMapping("/countries")
  @Operation(summary = "Autocomplete de paises", description = "Devuelve hasta 10 paises que comienzan con el prefijo indicado")
  public List<WeatherQueryResponseDTO> findByCountry(
      @Parameter(description = "Prefijo del pais") @RequestParam("query") String query) {
    if (!StringUtils.hasText(query)) {
      return List.of();
    }
    return service.findByCountry(query.trim());
  }

  private weatherQuery toDomain(WeatherQueryRegistrationRequestDTO request) {
    weatherQuery domain = new weatherQuery();
    domain.setTemperature(request.getTemperature());
    domain.setWeatherCondition(request.getWeatherCondition());
    domain.setRecommendedClothes(request.getRecommendedClothes());
    return domain;
  }
}
