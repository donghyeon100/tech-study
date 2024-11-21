package my.bdh.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import my.bdh.app.interceptor.AllQuestionHandler;

@Configuration // 서버 실행 시 내부 메서드 모두 실행
public class InterceptorConfig implements WebMvcConfigurer {

  // BoardNameInterceptor 클래스를 Bean으로 등록
  @Bean
  public AllQuestionHandler allQuestionHandler() {
    return new AllQuestionHandler();
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {

    registry.addInterceptor(allQuestionHandler())
        .addPathPatterns("/**") // "/" 이하 모든 요청 가로챔
        .excludePathPatterns( // 가로채지 않을 요청 주소 작성
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico");
  }

}