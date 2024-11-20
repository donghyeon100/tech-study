package my.bdh.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import my.bdh.app.dto.Question;
import my.bdh.app.mapper.QuestionsMapper;

@Service
@RequiredArgsConstructor
public class QuestionsServiceImpl implements QuestionsService {
  
  private final QuestionsMapper questionsMapper;

  public List<Question> selectTypeQuestions(int typeNo) {
    return questionsMapper.selectTypeQuestions(typeNo);
  }

  
}
  