package my.bdh.app.service;

import java.util.List;

import my.bdh.app.dto.Question;

public interface QuestionsService {

  List<Question> selectTypeQuestions(int typeNo);
  
}
