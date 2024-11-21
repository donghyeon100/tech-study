package my.bdh.app.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import my.bdh.app.dto.Question;
import my.bdh.app.service.QuestionsService;

@CrossOrigin
@Slf4j
@RestController
@PropertySource("classpath:config.properties")
@RequiredArgsConstructor
public class QuestionsController {

  private final QuestionsService questionsService;
  
  @Value("${groq.api.key}")
  private String groqApiKey;

  @Value("${groq.api.chat.options.model}")
  private String chatModel;

  @Value("${groq.api.base-url}")
  private String baseUrl;

  @Value("${allQuestions.pw}")
  private String allQuestionsPw;

  private final RestTemplate restTemplate;

  private final OpenAiChatModel openAiChatModel;


  /**
   * 요청 테스트
   * @return
   */
  @PostMapping("/test")
  public ResponseEntity<?> test() {

    // 헤더 설정
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(groqApiKey);
    headers.add("Cookie", "__cf_bm=8EY42U0I_lUC1hO5oT4ewwE1wA3LW0Bkhbp3vix1eb0-1731890574-1.0.1.1-TfayQF9PR5ofMsUp4x.BOWnDvInaQpErphoXU61lEtCTY2MqicXhk9PVtjoRubMb5yVM1HasC3ptSIzROqVBWQ");

    String requestBody = "{\"messages\": [{\"role\": \"user\", \"content\": \"Explain the importance of fast language models\"}], \"model\": \"llama3-8b-8192\"}";

    HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

    ResponseEntity<String> responseEntity = restTemplate.exchange(baseUrl, HttpMethod.POST, requestEntity, String.class);

    return ResponseEntity.ok(responseEntity.getBody());
  }


  @PostMapping(value="/test2", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> test2(@RequestBody Map<String, Object> request) throws JsonProcessingException {

    // 헤더 설정

    StringBuilder sb = new StringBuilder();
    sb.append("Q: ").append((String) request.get("Q")).append("\n");
    sb.append("A: ").append((String) request.get("A")).append("\n");
    sb.append("- 신입 개발자 면접 준비 위한 문제로, 답변을 자세히 응답(해당 답변을 B라고 부름) \n");
    sb.append("- B 답변의 결과는 항상 한글로 응답\n");
    sb.append("- A 답변이 B 답변과 얼마나 유사한지 %로 평가 \n");
    sb.append("- 응답 결과는 JSON");

    log.info("sb: {}", sb.toString());

    List<Map<String, Object>> messages = new ArrayList<>();
    messages.add(Map.of("role", "user", "content", sb.toString()));


    Map<String, Object> requestBodyMap = new HashMap<>();

    requestBodyMap.put("messages", messages);
    requestBodyMap.put("model", chatModel);
    requestBodyMap.put("temperature", 0.2);
    requestBodyMap.put("max_tokens", 1024);
    requestBodyMap.put("top_p", 1);
    requestBodyMap.put("stream", false);
    requestBodyMap.put("response_format", Map.of("type", "json_object"));
    requestBodyMap.put("stop", null);


    ObjectMapper objectMapper = new ObjectMapper();
    String requestBody = objectMapper.writeValueAsString(requestBodyMap);


    String responseEntity = restTemplate.postForObject(baseUrl, requestBody, String.class);
    log.info("responseEntity: {}", responseEntity);
    return ResponseEntity.ok(responseEntity);

  }


  /**
   * 답안 전송 후 GPT 응답
   * @param request
   * @return
   */
  @PostMapping(value="answer", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> gptResponse(@RequestBody Map<String, Object> request) {

    StringBuilder sb = new StringBuilder();
    sb.append("Q: ").append((String) request.get("Q")).append("\n");
    sb.append("A: ").append((String) request.get("A")).append("\n\n");

    sb.append("- 신입 개발자 기술 면접 서술형 문제 Q와 면접자의 답변 A임\n");
    sb.append("- 문제 Q에 대한 답변을 작성하고 A에 작성된 답변과 비교하는 것이 목적\n");
    sb.append("- answer : GPT가 제시하는 문제 답변\n");
    sb.append("- judgement : A에 작성된 답변이 answer를 유추할 수 있으면 0, 보충이 필요하면 1, 정답이 아닌 것 같으면 2\n");
    sb.append("- 단, A에 작성된 답변의 길이가 많이 짧거나, 단순 키워드만 작성되어 있으면 1 또는 2로 판별하기");
    sb.append("- reason : judgement 판별한 이유(A 언급 시 '작성한 답변' 으로 표기 \n");
    sb.append("- JSON으로 결과 반환");
    // sb.append("- JSON으로 결과 반환 : ex) {answer : 답, judgement : 1, reason : 이유}");

    // sb.append("- 신입 개발자 면접 준비 위한 문제로, 답변을 자세히 응답(해당 답변을 B라고 부름) \n");
    // sb.append("- B 답변의 결과는 항상 한글로 응답\n");
    // sb.append("- 문제에 답변을 한글로 자세히 응답 \n");
    // sb.append("- A에 작성된 답변과 응답 답변의 정확도 평가\n");
    // sb.append("- A에 작성된 답변이 응답 답변과 얼마나 유사한지 판병 \n");
    // sb.append("- 유사도 평가 시 신입 개발자 면접관이 평가하는 기준으로 평가 \n");
    // sb.append("- 유사도 평가 기준 :  핵심 키워드 포함 여부, 답변 길이, 답변 품질 \n");
    // sb.append("- 응답 결과는 JSON형태로 {answer : 응답답안, similarity : x%} 형태로 표기");

    log.info("sb: {}", sb.toString());


    StringBuilder sb2 = new StringBuilder();
    sb2.append("신입 자바 웹 개발자가 되려는 사람을 돕기위한 멘토 역할을 맡아줘. ");
    sb2.append("문제에 대한 핵심 키워드가 포함된 적당한 길이의 답변을 해줘. ");
    sb2.append("응답은 항상 {answer : 답변, judgement : 평가, reason : 이유} 형태의 JSON으로 응답해줘");

    ChatResponse  response =
    ChatClient
        .builder(openAiChatModel)
        // .defaultSystem("너는 신입 자바 웹 개발자를 뽑기 위한 면접관이야, 문제에 대한 핵심 키워드가 포함된 적당한 길이의 답변을 응답하고 답변의 유사도를 평가하는 면접관이야")
        .defaultSystem(sb2.toString())
        .defaultUser(sb.toString())
        .build()
        .prompt()
        .call()
        .chatResponse();

    log.info("response: {}", response);

    return ResponseEntity.ok(response.getResult().getOutput().getContent());
    // return ResponseEntity.ok(response);
  }


  @PostMapping(value="questions/{typeNo}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> questions(@PathVariable("typeNo") int typeNo, HttpServletRequest request) {

    ServletContext application = request.getServletContext();
    
    List<Question> questions = (List<Question>) application.getAttribute("questions-" + typeNo);

    // List<String> questions = new ArrayList<>();
    // questions.add("Java에서 예외를 처리하기 위한 구문을 모두 설명하시오. ");
    // questions.add("Spring에서 사용하는 @Controller 어노테이션에 대해 설명하시오.");
    // questions.add("Spring에서 사용하는 @Service 어노테이션에 대해 설명하시오.");
    // questions.add("Spring에서 사용하는 @Autowired 어노테이션에 대해 설명하시오.");
    // questions.add("Spring, MyBatis에서 사용하는 @Mapper 어노테이션에 대해 설명하시오.");

    // questions 요소 섞기
    Collections.shuffle(questions);

    return ResponseEntity.ok(questions);
  }


  /**
   * 타입별 문제 조회
   * @param request
   * @return
   */
  @PostMapping(value="typeQuestions")
  public ResponseEntity<?> selectTypeQuestions(@RequestBody Question qqq, HttpServletRequest request) {

    int typeNo = qqq.getTypeNo();

    List<Question> questions = questionsService.selectTypeQuestions(typeNo);

    ServletContext application = request.getServletContext();
    application.setAttribute("questions-" + typeNo, questions);

    return ResponseEntity.ok("조회 완료");
  }

  /**
   * 모든 문제 DB에서 조회 후 Application에 저장
   * @param request
   * @return
   */
  @GetMapping(value="allQuestions")
  public ResponseEntity<?> allQuestions(HttpServletRequest request, @RequestParam("pw") String pw) {

    if (!pw.equals(allQuestionsPw)) {
      return ResponseEntity.ok("실패");
    }

    ServletContext application = request.getServletContext();
    for (int typeNo = 1; typeNo <= 9; typeNo++) {
      List<Question> questions = questionsService.selectTypeQuestions(typeNo);
      application.setAttribute("questions-" + typeNo, questions);
    }

    return ResponseEntity.ok("DB 조회 후 Application에 저장 완료");
  }


}





