package my.bdh.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Question {
  private int questionNo;
  private String questionContent;
  private int typeNo;
  private String typeName;
}
