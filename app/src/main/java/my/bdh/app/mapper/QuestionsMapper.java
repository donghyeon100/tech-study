package my.bdh.app.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import my.bdh.app.dto.Question;

@Mapper
public interface QuestionsMapper {

  List<Question> selectTypeQuestions(int typeNo);
  
}
