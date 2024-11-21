package my.bdh.app.interceptor;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import my.bdh.app.dto.Question;
import my.bdh.app.service.QuestionsService;

@Component
@Slf4j
public class AllQuestionHandler implements HandlerInterceptor {

  @Autowired
  private QuestionsService questionsService;

  @Override
  public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
      @Nullable ModelAndView modelAndView) throws Exception {

    ServletContext application = request.getServletContext();

		
		if(application.getAttribute("questions-" + 1) == null) {
			
			 log.info("----- 모든 문제 조회 조회 -----");
			 
       for (int typeNo = 1; typeNo <= 9; typeNo++) {
        List<Question> questions = questionsService.selectTypeQuestions(typeNo);
        application.setAttribute("questions-" + typeNo, questions);
      }
		}
		

    HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
  }

}
