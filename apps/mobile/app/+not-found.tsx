import { CenteredContainer } from "@/src/presentation/theme/primitives";
import styled from "@emotion/native";

const Message = styled.Text`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

export default function NotFoundScreen() {
  return (
    <CenteredContainer>
      <Message>Screen not found.</Message>
    </CenteredContainer>
  );
}
