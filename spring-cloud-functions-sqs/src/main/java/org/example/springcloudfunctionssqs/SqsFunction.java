package org.example.springcloudfunctionssqs;

import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class SqsFunction implements Function<String, Void> {

	@Override
	public Void apply(String s) {
		System.out.println("Received message: " + s);
		return null;
	}
}
