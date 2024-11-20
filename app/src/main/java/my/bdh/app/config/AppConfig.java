package my.bdh.app.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import lombok.val;

@Configuration
@PropertySource("classpath:config.properties")
public class AppConfig {

  @Value("${spring.ai.openai.api-key}")
  private String openaiApiKey;

  @Value("${groq.api.key}")
  private String groqApiKey;

  @Value("${groq.api.chat.options.model}")
  private String chatModel;

  
  @Bean
  public RestTemplate restTemplate() {
    RestTemplate restTemplate = new RestTemplate(); // RestTemplate 객체 생성
    restTemplate.getInterceptors().add((request, body, execution) -> { // 요청 인터셉터 추가
      // 헤더 설정
      request.getHeaders().setBearerAuth(groqApiKey); // Bearer 인증 헤더 설정
      request.getHeaders().setContentType(MediaType.APPLICATION_JSON); // Content-Type을 JSON으로 설정
      request.getHeaders().add("Cookie", "__cf_bm=8EY42U0I_lUC1hO5oT4ewwE1wA3LW0Bkhbp3vix1eb0-1731890574-1.0.1.1-TfayQF9PR5ofMsUp4x.BOWnDvInaQpErphoXU61lEtCTY2MqicXhk9PVtjoRubMb5yVM1HasC3ptSIzROqVBWQ"); // Cookie 헤더 추가

      return execution.execute(request, body); // 요청 실행
    });

    return restTemplate; // 설정된 RestTemplate 반환
  }


  // @Bean
  // public ChatClient chatClient(ChatClient.Builder builder) {
  //   return builder.build();
  // }

  @Bean
  public OpenAiApi openAiApi() {
    return new OpenAiApi(openaiApiKey);
  }

  @Bean
  public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
      val options = OpenAiChatOptions
      .builder()
      .withModel("gpt-4o-mini")
      .withTemperature(0.8)
      .withMaxTokens(500)
      .build();
    return new OpenAiChatModel(openAiApi, options);
  }
}
