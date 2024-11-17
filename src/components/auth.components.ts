import { styled } from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  padding: 50px 0px;
`;

export const Title = styled.h1`
  font-size: 42px;
  text-align: center;
`;

export const Form = styled.form`
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const Input = styled.input`
  padding: 10px 0;
  padding-left: 10px;
  border-radius: 50px;
  border: 1px solid #777777;
  width: 98%;
  font-size: 16px;
  &[type="submit"] {
    cursor: pointer;
    width: 100%;
    &:hover {
      opacity: 0.8;
    }
  }
`;

export const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  padding-left: 10px;
  a {
    color: #1d9bf0;
  }
`;